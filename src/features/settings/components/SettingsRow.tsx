import { Pressable, StyleSheet, Text, View } from 'react-native';
import SettingsToggle from './SettingsToggle';

type SettingsRowProps = {
  chevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  onToggle?: (next: boolean) => void;
  subtitle: string;
  title: string;
  toggled?: boolean;
  value?: string;
};

const SettingsRow = ({
  chevron,
  destructive,
  onPress,
  onToggle,
  subtitle,
  title,
  toggled,
  value,
}: SettingsRowProps) => {
  const content = (
    <>
      <View style={styles.texts}>
        <Text style={[styles.title, destructive && styles.destructive]}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {onToggle ? (
        <SettingsToggle value={!!toggled} onChange={onToggle} />
      ) : value ? (
        <Text style={styles.value}>{value}</Text>
      ) : chevron ? (
        <Text style={styles.chevron}>›</Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
};

const styles = StyleSheet.create({
  chevron: {
    color: '#d1d4d5',
    fontSize: 20,
  },
  destructive: {
    color: '#ee2b2b',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowPressed: {
    backgroundColor: '#f7f7f8',
  },
  subtitle: {
    color: '#5e5e66',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  texts: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
  },
  value: {
    color: '#5e5e66',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SettingsRow;
