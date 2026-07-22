import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { listTimeline } from '../api/trees';
import { colors } from '../theme/theme';

export default function TimelineView({ treeId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listTimeline(treeId);
      setEvents(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [treeId]);

  useEffect(() => {
    load();
  }, [load]);

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  function title(event) {
    switch (event.type) {
      case 'birth':
        return '🎂 Рождение';
      case 'death':
        return '🕊 Смерть';
      case 'life_event':
        return event.title;
      default:
        return 'Событие';
    }
  }

  function subtitle(event) {
    if (event.type === 'life_event')
      return event.description || '';

    return `${event.person.first_name} ${event.person.last_name}`;
  }

  function format(date) {
    return new Date(date).toLocaleDateString('ru-RU');
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          color={colors.olive}
          size="large"
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {events.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>
            Пока нет событий
          </Text>
        </View>
      ) : (
        events.map(item => (
          <View
            key={item.id}
            style={styles.card}
          >
            <Text style={styles.date}>
              {format(item.date)}
            </Text>

            <Text style={styles.title}>
              {title(item)}
            </Text>

            <Text style={styles.subtitle}>
              {subtitle(item)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 14,
  },

  date: {
    color: colors.olive,
    fontWeight: '700',
    fontFamily: 'Times',
    marginBottom: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    fontFamily: 'Times',
  },

  subtitle: {
    marginTop: 4,
    color: colors.ink,
    opacity: 0.7,
  },

  empty: {
    color: colors.ink,
    opacity: 0.5,
    fontFamily: 'Times',
    fontSize: 15,
  },
});