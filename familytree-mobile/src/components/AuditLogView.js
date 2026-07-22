import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { isNetworkError } from '../services/apiClient';
import {
  listAuditLogs,
} from '../api/auditLogs';


import {
  cacheGet,
  cacheSet,
  cacheKeys,
} from '../services/offlineCache';

import OfflineBanner from './OfflineBanner';

import {
  useNetworkStatus,
} from '../hooks/useNetworkStatus';

import {
  colors,
} from '../theme/theme';

export default function AuditLogView({
  treeId,
}) {
  const {
    isOnline,
    syncing,
    pendingCount,
  } = useNetworkStatus();

  const [logs, setLogs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const loadLogs = useCallback(async () => {

    try {

      setError('');

      const data =
        await listAuditLogs(treeId);

      setLogs(data);

      await cacheSet(
        cacheKeys.auditLogs(treeId),
        data
      );

    } catch (e) {

      if (isNetworkError(e)) {

        const cached =
          await cacheGet(
            cacheKeys.auditLogs(treeId)
          );

        if (cached?.value) {

          setLogs(cached.value);

        } else {

          setError(
            ''
          );

        }

      } else {

        setError(
          ''
        );

      }

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  }, [treeId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  function onRefresh() {

    setRefreshing(true);

    loadLogs();

  }

  function formatDate(date) {

    if (!date)
      return '';

    return new Date(date)
      .toLocaleString('ru-RU');

  }

  function actionLabel(item) {

  if (
    item.action === 'create' &&
    item.content_type === 'Person'
  )
    return 'Добавлен человек';

  if (
    item.action === 'update' &&
    item.content_type === 'Person'
  )
    return 'Изменены данные человека';

  if (
    item.action === 'delete' &&
    item.content_type === 'Person'
  )
    return 'Удалён человек';

  if (
    item.action === 'create' &&
    item.content_type === 'Relationship'
  )
    return 'Добавлена связь';

  if (
    item.action === 'delete' &&
    item.content_type === 'Relationship'
  )
    return 'Удалена связь';

  if (
    item.action === 'create' &&
    item.content_type === 'LifeEvent'
  )
    return 'Добавлено событие';

  if (
    item.action === 'delete' &&
    item.content_type === 'LifeEvent'
  )
    return 'Удалено событие';

  if (
    item.action === 'update' &&
    item.content_type === 'FamilyTree'
  )
    return 'Изменены настройки дерева';

  if (
    item.action === 'delete' &&
    item.content_type === 'TreeMember'
  )
    return 'Удалён участник';

  return 'Действие';
}

    if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.olive}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <OfflineBanner
        isOnline={isOnline}
        syncing={syncing}
        pendingCount={pendingCount}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.olive}
          />
        }
        contentContainerStyle={styles.content}
      >

        {!!error && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        {!error && logs.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              Журнал пуст
            </Text>

            <Text style={styles.emptyText}>
              Пока никаких действий не зарегистрировано.
            </Text>
          </View>
        )}

        {logs.map(item => (
          <View
            key={item.id}
            style={styles.card}
          >
            <Text style={styles.action}>
              {actionLabel(item)}
            </Text>

            {!!item.person_name && (
              <Text style={styles.person}>
                {item.person_name}
              </Text>
            )}

            {!!item.actor_username && (
              <Text style={styles.actor}>
                {item.actor_username}
              </Text>
            )}

            <Text style={styles.date}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        ))}

      </ScrollView>

    </View>
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

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: colors.creamLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.creamBorder,
    padding: 16,
    marginBottom: 12,
  },

  action: {
    fontSize: 15,
    fontFamily: 'Times',
    fontWeight: '700',
    color: colors.ink,
  },

  person: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: 'Times',
    color: colors.ink,
  },

  actor: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Times',
    color: colors.ink,
    opacity: 0.7,
  },

  date: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: 'Times',
    color: colors.ink,
    opacity: 0.5,
  },

  error: {
    textAlign: 'center',
    fontFamily: 'Times',
    color: '#C62828',
    marginBottom: 16,
  },

  empty: {
    alignItems: 'center',
    marginTop: 60,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Times',
    color: colors.ink,
  },

  emptyText: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.ink,
    fontFamily: 'Times',
    opacity: 0.6,
  },
});