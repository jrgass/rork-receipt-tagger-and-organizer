import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, Keyboard } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { useSession } from "@/hooks/session-store";
import { ChevronDown, User, MapPin, Calendar, KeyboardIcon } from "lucide-react-native";

type Location = 'GR' | 'OK' | 'MA';

const LOCATIONS: { value: Location; label: string }[] = [
  { value: 'GR', label: 'GR' },
  { value: 'OK', label: 'OK' },
  { value: 'MA', label: 'MA' },
];

export default function StartSessionScreen() {
  const { startNewSession } = useSession();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState<Location>('GR');
  const [sessionId, setSessionId] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const insets = useSafeAreaInsets();

  // Auto-generate session ID when first name, last name, or location changes
  useEffect(() => {
    if (firstName.trim() && lastName.trim()) {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const year = today.getFullYear();
      
      const firstInitial = firstName.trim().charAt(0).toUpperCase();
      const lastInitial = lastName.trim().charAt(0).toUpperCase();
      
      const generatedId = `${firstInitial}${lastInitial}${month}${day}${year}`;
      setSessionId(generatedId);
    } else {
      setSessionId('');
    }
  }, [firstName, lastName]);

  const handleStartSession = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setShowErrorModal(true);
      return;
    }

    // Start the session with user info
    startNewSession({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      location,
      sessionId,
    });

    // Navigate to home screen
    router.replace('/home');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Start New Session</Text>
        <Text style={styles.subtitle}>Enter your information to begin</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              autoCapitalize="words"
              testID="first-name-input"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              autoCapitalize="words"
              testID="last-name-input"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TouchableOpacity 
            style={styles.dropdownContainer}
            onPress={() => setShowLocationPicker(!showLocationPicker)}
            testID="location-dropdown"
          >
            <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
            <Text style={styles.dropdownText}>{location}</Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>
          
          {showLocationPicker && (
            <View style={styles.dropdown}>
              {LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc.value}
                  style={[
                    styles.dropdownItem,
                    location === loc.value && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setLocation(loc.value);
                    setShowLocationPicker(false);
                  }}
                  testID={`location-option-${loc.value}`}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    location === loc.value && styles.dropdownItemTextSelected
                  ]}>
                    {loc.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Session ID</Text>
          <View style={styles.inputContainer}>
            <Calendar size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={sessionId}
              editable={false}
              placeholder="Auto-generated"
              testID="session-id-input"
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.hideKeyboardButton}
          onPress={() => Keyboard.dismiss()}
          testID="hide-keyboard-button"
        >
          <KeyboardIcon size={20} color="#6B7280" />
          <Text style={styles.hideKeyboardText}>Hide Keyboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.startButton,
            (!firstName.trim() || !lastName.trim()) && styles.startButtonDisabled
          ]}
          onPress={handleStartSession}
          disabled={!firstName.trim() || !lastName.trim()}
          testID="start-session-button"
        >
          <Text style={[
            styles.startButtonText,
            (!firstName.trim() || !lastName.trim()) && styles.startButtonTextDisabled
          ]}>
            Start Session
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Missing Information</Text>
            <Text style={styles.modalText}>Please enter both first and last name.</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  disabledInput: {
    color: '#6B7280',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dropdownItemTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 40,
  },
  hideKeyboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  hideKeyboardText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 0,
  },
  startButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  startButtonTextDisabled: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});