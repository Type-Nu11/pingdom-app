import React, { type ReactNode } from 'react';
import {
  Modal as NativeModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from './Button';

type ModalProps = {
  children: ReactNode;
  closeLabel: string;
  onClose: () => void;
  title: string;
  visible: boolean;
};

const Modal = ({ children, closeLabel, onClose, title, visible }: ModalProps) => (
  <NativeModal
    animationType="fade"
    onRequestClose={onClose}
    presentationStyle="overFullScreen"
    transparent
    visible={visible}
  >
    <View style={styles.backdrop}>
      <Pressable
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        onPress={onClose}
        style={StyleSheet.absoluteFill}
      />
      <View
        accessibilityLabel={title}
        accessibilityRole="summary"
        accessibilityViewIsModal
        style={styles.dialog}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          {children}
          <Button label={closeLabel} onPress={onClose} />
        </ScrollView>
      </View>
    </View>
  </NativeModal>
);

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(16, 24, 40, 0.56)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: { gap: 16, padding: 24 },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '85%',
    maxWidth: 560,
    width: '100%',
  },
  title: { color: '#101828', fontSize: 24, fontWeight: '700', lineHeight: 32 },
});

export default Modal;
