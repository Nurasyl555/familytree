import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';

import * as Clipboard from 'expo-clipboard';

import {
  generateInvite,
  listMembers,
  removeMember,
  updateTreePrivacy,
} from '../api/trees';

import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/theme';

const ROLE_LABELS = {
  owner: 'Владелец',
  editor: 'Редактор',
  reader: 'Читатель',
};

const PRIVACY_OPTIONS = [
  {
    value: 'public',
    label: '🌐 Открытое',
  },
  {
    value: 'link',
    label: '🔗 По ссылке',
  },
  {
    value: 'private',
    label: '🔒︎ Закрытое',
  },
];

export default function InviteManager({
  treeId,
  privacy,
  onPrivacyUpdated,
}) {

  const currentUserId =
    useAuthStore(state => state.userId);

  const [role, setRole] =
    useState('editor');

  const [inviteLink, setInviteLink] =
    useState('');

  const [copied, setCopied] =
    useState(false);

  const [error, setError] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const [updatingPrivacy, setUpdatingPrivacy] =
    useState(false);

  const [members, setMembers] =
    useState([]);

  const [membersLoading, setMembersLoading] =
    useState(true);

  const [membersError, setMembersError] =
    useState('');

  const [removingId, setRemovingId] =
    useState(null);

  useEffect(() => {
    loadMembers();
  }, [treeId]);

  async function loadMembers() {

    setMembersLoading(true);
    setMembersError('');

    try {

      const data =
        await listMembers(treeId);

      setMembers(data);

    } catch {

      setMembersError(
        'Не удалось загрузить участников'
      );

    } finally {

      setMembersLoading(false);

    }
  }

  async function handleRemoveMember(member) {

    Alert.alert(
      'Удалить участника?',
      member.username,
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {

            try {

              setRemovingId(member.user_id);

              await removeMember(
                treeId,
                member.user_id
              );

              setMembers(prev =>
                prev.filter(
                  m =>
                    m.user_id !==
                    member.user_id
                )
              );

            } catch {

              Alert.alert(
                'Ошибка',
                'Не удалось удалить участника'
              );

            } finally {

              setRemovingId(null);

            }
          },
        },
      ]
    );
  }

  async function handlePrivacyChange(value) {

    if (value === privacy)
      return;

    try {

      setUpdatingPrivacy(true);

      await updateTreePrivacy(
        treeId,
        value
      );

      onPrivacyUpdated?.(value);

    } catch {

      Alert.alert(
        'Ошибка',
        'Не удалось изменить уровень доступа'
      );

    } finally {

      setUpdatingPrivacy(false);

    }
  }

  async function handleGenerateInvite() {

    try {

      setSubmitting(true);

      setInviteLink('');

      const data =
        await generateInvite(
          treeId,
          {
            role,
            email: '',
          }
        );

      const url =
        `https://familytree.app/invite/${data.token}`;

      setInviteLink(url);

    } catch {

      Alert.alert(
        'Ошибка',
        'Не удалось создать приглашение'
      );

    } finally {

      setSubmitting(false);

    }
  }

  async function handleCopy() {

    await Clipboard.setStringAsync(inviteLink);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  async function handleShare() {

    try {

      await Share.share({
        message: inviteLink,
      });

    } catch {}

  }

  return (
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={styles.content}
>

    <Text style={styles.title}>
      Управление доступом
    </Text>

    <Text style={styles.subtitle}>
      Кто может просматривать и редактировать это дерево
    </Text>

    {/* ---------- Privacy ---------- */}

    <Text style={styles.sectionTitle}>
      Тип доступа
    </Text>

    <View style={styles.privacyRow}>
      {PRIVACY_OPTIONS.map(item => {

        const active =
          item.value === privacy;

        return (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.privacyButton,
              active &&
                styles.privacyButtonActive,
            ]}
            disabled={updatingPrivacy}
            onPress={() =>
              handlePrivacyChange(item.value)
            }
          >
            <Text
              style={[
                styles.privacyText,
                active &&
                  styles.privacyTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>

    {/* ---------- Invite role ---------- */}

    <Text style={styles.sectionTitle}>
      Роль приглашённого
    </Text>

    <View style={styles.roleRow}>

      {['reader','editor','owner'].map(r => (

        <TouchableOpacity
          key={r}
          style={[
            styles.roleButton,
            role === r &&
              styles.roleButtonActive,
          ]}
          onPress={() => setRole(r)}
        >

          <Text
            style={[
              styles.roleText,
              role === r &&
                styles.roleTextActive,
            ]}
          >
            {ROLE_LABELS[r]}
          </Text>

        </TouchableOpacity>

      ))}

    </View>

    <TouchableOpacity
      style={styles.generateButton}
      disabled={submitting}
      onPress={handleGenerateInvite}
    >

      <Text style={styles.generateText}>
        {submitting
          ? 'Создание...'
          : 'Создать приглашение'}
      </Text>

    </TouchableOpacity>

    {!!inviteLink && (

      <View style={styles.linkCard}>

        <Text style={styles.linkText}>
          {inviteLink}
        </Text>

        <View style={styles.actions}>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopy}
          >

            <Text style={styles.actionText}>
              {copied
                ? '✓ Скопировано'
                : 'Копировать'}
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >

            <Text style={styles.actionText}>
              Поделиться
            </Text>

          </TouchableOpacity>

        </View>

      </View>

    )}

    {/* ---------- Members ---------- */}

    <Text style={styles.sectionTitle}>
      Участники
    </Text>

    {membersLoading ? (

      <ActivityIndicator
        color={colors.olive}
      />

    ) : members.length === 0 ? (

      <Text style={styles.empty}>
        Пока только вы.
      </Text>

    ) : (

      members.map(member => (

        <View
          key={member.user_id}
          style={styles.member}
        >

          <View style={{ flex:1 }}>

            <Text style={styles.memberName}>
              {member.username}
            </Text>

            <Text style={styles.memberRole}>
              {ROLE_LABELS[member.role]}
            </Text>

          </View>

          {member.user_id !== currentUserId && (

            <TouchableOpacity
              disabled={
                removingId === member.user_id
              }
              style={styles.removeButton}
              onPress={() =>
                handleRemoveMember(member)
              }
            >

              <Text
                style={styles.removeText}
              >
                Удалить
              </Text>

            </TouchableOpacity>

          )}

        </View>

      ))

    )}

    {!!membersError && (

      <Text style={styles.error}>
        {membersError}
      </Text>

    )}

    {!!error && (

      <Text style={styles.error}>
        {error}
      </Text>

    )}

  </ScrollView>
);
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    fontFamily: 'Times',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: colors.ink,
    opacity: .6,
    fontFamily: 'Times',
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    fontFamily: 'Times',
    marginBottom: 12,
    marginTop: 12,
  },

  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  privacyButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    backgroundColor: colors.creamLight,
    alignItems: 'center',
  },

  privacyButtonActive: {
    backgroundColor: colors.olive,
    borderColor: colors.olive,
  },

  privacyText: {
    fontSize: 12,
    color: colors.ink,
    fontFamily: 'Times',
    fontWeight: '600',
  },

  privacyTextActive: {
    color: colors.white,
  },

  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  roleButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: colors.creamLight,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    alignItems: 'center',
  },

  roleButtonActive: {
    backgroundColor: colors.olive,
    borderColor: colors.olive,
  },

  roleText: {
    fontWeight: '600',
    color: colors.ink,
    fontFamily: 'Times',
    fontSize: 13,
  },

  roleTextActive: {
    color: colors.white,
    fontFamily: 'Times',
  },

  generateButton: {
    backgroundColor: colors.olive,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
  },

  generateText: {
    color: colors.white,
    fontWeight: '700',
    fontFamily: 'Times',
    fontSize: 15,
  },

  linkCard: {
    backgroundColor: colors.creamLight,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    marginBottom: 24,
  },

  linkText: {
    fontSize: 12,
    fontFamily: 'Times',
    color: colors.ink,
    marginBottom: 12,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  actionButton: {
    flex: 1,
    backgroundColor: colors.olive,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  actionText: {
    color: colors.white,
    fontWeight: '600',
    fontFamily: 'Times',
    fontSize: 13,
  },

  member: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    padding: 14,
    marginBottom: 10,
  },

  memberName: {
    fontWeight: '700',
    fontFamily: 'Times',
    color: colors.ink,
    fontSize: 15,
  },

  memberRole: {
    color: colors.ink,
    opacity: .55,
    marginTop: 2,
    fontFamily: 'Times',
    fontSize: 12,
  },

  removeButton: {
    backgroundColor: '#FFECEC',
    borderWidth: 1,
    borderColor: '#E57373',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  removeText: {
    color: '#D32F2F',
    fontFamily: 'Times',
    fontWeight: '700',
    fontSize: 12,
  },

  empty: {
    textAlign: 'center',
    color: colors.ink,
    opacity: .5,
    fontFamily: 'Times',
    marginVertical: 24,
    fontSize: 14,
  },

  error: {
    color: '#C62828',
    marginTop: 12,
    fontSize: 13,
    fontFamily: 'Times',
    textAlign: 'center',
  },

});