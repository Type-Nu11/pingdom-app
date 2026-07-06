import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SettingsNavBar from './SettingsNavBar';

type LegalSection = {
  body: string;
  heading: string;
};

type LegalTextPageProps = {
  meta: string;
  onBack: () => void;
  sections: LegalSection[];
  title: string;
};

const LegalTextPage = ({ meta, onBack, sections, title }: LegalTextPageProps) => (
  <View style={styles.screen}>
    <SettingsNavBar title={title} onBack={onBack} />
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.meta}>{meta}</Text>
      {sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={styles.heading}>{section.heading}</Text>
          <Text style={styles.body}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  body: {
    color: '#3b3b40',
    fontSize: 14,
    lineHeight: 22,
  },
  content: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heading: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  meta: {
    color: '#5e5e66',
    fontSize: 13,
    paddingTop: 8,
  },
  screen: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
});

export default LegalTextPage;
