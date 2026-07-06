import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BLOCKED_USERS } from '../constants/legalContent';
import SettingsDivider from './SettingsDivider';
import SettingsNavBar from './SettingsNavBar';

type BlockedUsersViewProps = {
  onBack: () => void;
};

const BlockedUsersView = ({ onBack }: BlockedUsersViewProps) => {
  const [unblockedIds, setUnblockedIds] = useState<string[]>([]);

  return (
    <View style={styles.screen}>
      <SettingsNavBar title="차단한 사용자 관리" onBack={onBack} />
      <FlatList
        data={BLOCKED_USERS}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={SettingsDivider}
        renderItem={({ item }) => {
          const isUnblocked = unblockedIds.includes(item.id);
          return (
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>🙂</Text>
              </View>
              <View style={styles.texts}>
                <Text style={styles.name}>{item.id}</Text>
                <Text style={styles.sub}>{item.blockedAt}</Text>
              </View>
              <Pressable
                disabled={isUnblocked}
                style={[styles.pillButton, isUnblocked && styles.pillButtonUnblocked]}
                onPress={() => setUnblockedIds((prev) => [...prev, item.id])}
              >
                <Text style={[styles.pillText, isUnblocked && styles.pillTextUnblocked]}>
                  {isUnblocked ? '차단 해제됨' : '차단 해제'}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#f0f0f1',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarEmoji: {
    fontSize: 16,
  },
  name: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
  pillButton: {
    borderColor: '#e4e4e5',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillButtonUnblocked: {
    borderColor: '#d1d4d5',
  },
  pillText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextUnblocked: {
    color: '#5e5e66',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  screen: {
    flex: 1,
  },
  sub: {
    color: '#5e5e66',
    fontSize: 13,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
});

export default BlockedUsersView;
