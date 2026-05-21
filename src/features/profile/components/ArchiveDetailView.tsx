import { ScrollView, StyleSheet } from 'react-native';
import ArchiveFeedItem from './ArchiveFeedItem';

type ArchiveDetailViewProps = {
  onOpenLikes: () => void;
};

const ArchiveDetailView = ({ onOpenLikes }: ArchiveDetailViewProps) => (
  <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={styles.scroll}>
    <ArchiveFeedItem isFirst onOpenLikes={onOpenLikes} />
    <ArchiveFeedItem onOpenLikes={onOpenLikes} />
  </ScrollView>
);

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
});

export default ArchiveDetailView;
