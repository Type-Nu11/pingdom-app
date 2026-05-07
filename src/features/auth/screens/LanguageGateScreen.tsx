import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Slider from '@react-native-community/slider';
import SubmitButton from '../components/SubmitButton';

type LanguageGateScreenProps = {
  onSubmit?: () => void;
};

export default function LanguageGateScreen({ onSubmit }: LanguageGateScreenProps) {
  const [language, setLanguage] = useState('ko');
  const [country, setCountry] = useState('kr');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState(50);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>최선의 경로를{'\n'}추천해드려요!</Text>

      <Text style={styles.label}>언어</Text>
      <Dropdown
        style={styles.dropdown}
        selectedTextStyle={styles.dropdownText}
        data={[
          { label: 'Korean', value: 'ko' },
          { label: 'English', value: 'en' },
        ]}
        labelField="label"
        valueField="value"
        value={language}
        onChange={(item) => setLanguage(item.value)}
      />

      <Text style={styles.label}>국적</Text>
      <Dropdown
        style={styles.dropdown}
        selectedTextStyle={styles.dropdownText}
        data={[
          { label: '🇰🇷 South Korea', value: 'kr' },
          { label: '🇺🇸 United States', value: 'us' },
        ]}
        labelField="label"
        valueField="value"
        value={country}
        onChange={(item) => setCountry(item.value)}
      />

      <Text style={styles.label}>성별</Text>
      <View style={styles.radioRow}>
        <Pressable style={styles.radioItem} onPress={() => setGender('male')}>
          <View style={[styles.radio, gender === 'male' && styles.radioActive]} />
          <Text style={gender === 'male' ? styles.activeText : styles.inactiveText}>남성</Text>
        </Pressable>

        <Pressable style={styles.radioItem} onPress={() => setGender('female')}>
          <View style={[styles.radio, gender === 'female' && styles.radioActive]} />
          <Text style={gender === 'female' ? styles.activeText : styles.inactiveText}>여성</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>나이</Text>
      <View style={styles.ageValue}>
        <Text>{age}</Text>
      </View>
      <View style={styles.sliderRow}>
        <Text>0</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={age}
          minimumTrackTintColor="#ff2b6d"
          maximumTrackTintColor="#000"
          thumbTintColor="#ff2b6d"
          onValueChange={setAge}
        />
        <Text>100+</Text>
      </View>
      <SubmitButton onPress={onSubmit}></SubmitButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingTop: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    marginBottom: 46,
  },
  label: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 14,
  },
  dropdown: {
    width: 220,
    height: 38,
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 44,
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  radioRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 44,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 15,
    height: 15,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#bbb',
  },
  radioActive: {
    borderWidth: 4,
    borderColor: '#ff2b6d',
  },
  activeText: {
    color: '#ff2b6d',
    fontSize: 14,
  },
  inactiveText: {
    color: '#aaa',
    fontSize: 14,
  },
  ageValue: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 80,
  },
  slider: {
    flex: 1,
    height: 30,
  },
  submitText: {
    fontSize: 15,
    color: '#000',
  },
});
