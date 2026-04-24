import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { GradientBackground } from '@/components/GradientBackground';
import { TEXT_DARK, TEXT_MID } from '@/constants/theme';
import { db } from './index';
import migrations from '../drizzle/migrations';
import { seedIfNeeded } from './seed';
import { migrateFromAsyncStorageIfNeeded } from './migrateFromAsyncStorage';

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error } = useMigrations(db, migrations);
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success) return;
    let cancelled = false;
    (async () => {
      try {
        await migrateFromAsyncStorageIfNeeded();
        await seedIfNeeded();
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setBootError(e as Error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [success]);

  const err = error ?? bootError;
  if (err) {
    return (
      <View style={styles.root}>
        <GradientBackground />
        <Text style={styles.errTitle}>Database error</Text>
        <Text style={styles.errBody}>{err.message}</Text>
      </View>
    );
  }

  if (!success || !ready) {
    return (
      <View style={styles.root}>
        <GradientBackground />
        <Text style={styles.loading}>Loading…</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loading: {
    color: TEXT_MID,
    fontSize: 14,
  },
  errTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  errBody: {
    color: TEXT_MID,
    textAlign: 'center',
    fontSize: 13,
  },
});
