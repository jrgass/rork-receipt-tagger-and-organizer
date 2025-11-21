import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, Modal, Keyboard } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { useSession } from "@/hooks/session-store";
import { CATEGORIES } from "@/constants/categories";
import { Receipt } from "@/types/receipt";
import { Save, X, AlertCircle, KeyboardIcon } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReceiptDetailsScreen() {
  const params = useLocalSearchParams();
  const { addReceipt, updateReceipt, currentSession } = useSession();
  
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cost, setCost] = useState('');
  const [glCode, setGlCode] = useState('');
  const [showMissingInfoModal, setShowMissingInfoModal] = useState(false);
  const [showInvalidDateModal, setShowInvalidDateModal] = useState(false);

  useEffect(() => {
    if (params.mode === 'edit' && params.receiptId && currentSession) {
      const receipt = currentSession.receipts.find(r => r.id === params.receiptId);
      if (receipt) {
        setDate(receipt.date);
        setDescription(receipt.description);
        setPurpose(receipt.purpose);
        setSelectedCategory(receipt.category);
        setCost(receipt.cost);
        setGlCode(receipt.glCode);
      }
    } else {
      // Set today's date as default for new receipts
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const year = today.getFullYear();
      setDate(`${month}${day}${year}`);
    }
  }, [params, currentSession]);

  const handleCategorySelect = (categoryName: string) => {
    const trimmedName = categoryName.trim();
    if (trimmedName && trimmedName.length <= 100) {
      setSelectedCategory(trimmedName);
      const category = CATEGORIES.find(c => c.name === trimmedName);
      if (category && currentSession?.userInfo?.location) {
        // Generate location-based GL code
        const baseGlCode = category.glCode;
        const location = currentSession.userInfo.location;
        
        // If the GL code is "Misc. Expense", keep it as is
        if (baseGlCode === 'Misc. Expense') {
          setGlCode(baseGlCode);
        } else {
          // Append location to the GL code
          setGlCode(`${baseGlCode}-${location}`);
        }
      } else if (category) {
        setGlCode(category.glCode);
      }
    }
  };

  const formatDate = (input: string) => {
    // Remove non-numeric characters
    const cleaned = input.replace(/\D/g, '');
    
    // Limit to 8 digits
    const limited = cleaned.slice(0, 8);
    
    setDate(limited);
  };

  const formatCost = (input: string) => {
    // Allow only numbers and decimal point
    const cleaned = input.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      setCost(parts[0] + '.' + parts[1].slice(0, 2));
    } else {
      setCost(cleaned);
    }
  };

  const handleSave = () => {
    // Validate required fields
    if (!date || !description || !selectedCategory || !cost) {
      setShowMissingInfoModal(true);
      return;
    }

    // Validate date format
    if (date.length !== 8) {
      setShowInvalidDateModal(true);
      return;
    }

    const receiptData: Receipt = {
      id: params.receiptId as string || Date.now().toString(),
      imageUri: params.imageUri as string || '',
      date: `${date.slice(0, 2)}/${date.slice(2, 4)}/${date.slice(4, 8)}`,
      description,
      purpose,
      category: selectedCategory,
      glCode,
      cost,
      timestamp: Date.now(),
    };

    if (params.mode === 'edit') {
      updateReceipt(params.receiptId as string, receiptData);
    } else {
      addReceipt(receiptData);
    }

    router.back();
    if (params.mode === 'new' && params.imageUri) {
      router.back(); // Go back twice to close camera modal too
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Receipt Details</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.hideKeyboardButton} onPress={() => Keyboard.dismiss()}>
              <KeyboardIcon size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={24} color="#4F46E5" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {params.imageUri && params.mode === 'new' && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: params.imageUri as string }} style={styles.receiptImage} />
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date (MMDDYYYY) *</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={formatDate}
                placeholder="01312024"
                keyboardType="numeric"
                maxLength={8}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Office supplies from Staples"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Purpose</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={purpose}
                onChangeText={setPurpose}
                placeholder="Purchased for Q1 marketing campaign"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                <View style={styles.categoryList}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category.name && styles.categoryButtonActive
                      ]}
                      onPress={() => handleCategorySelect(category.name)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        selectedCategory === category.name && styles.categoryButtonTextActive
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {glCode !== '' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>GL Code</Text>
                <View style={styles.glCodeContainer}>
                  <Text style={styles.glCode}>{glCode}</Text>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cost ($) *</Text>
              <TextInput
                style={styles.input}
                value={cost}
                onChangeText={formatCost}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      
      <Modal visible={showMissingInfoModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AlertCircle size={48} color="#EF4444" />
            <Text style={styles.modalTitle}>Missing Information</Text>
            <Text style={styles.modalText}>Please fill in all required fields</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowMissingInfoModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal visible={showInvalidDateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AlertCircle size={48} color="#EF4444" />
            <Text style={styles.modalTitle}>Invalid Date</Text>
            <Text style={styles.modalText}>Please enter date in MMDDYYYY format</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowInvalidDateModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hideKeyboardButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    padding: 16,
    alignItems: 'center',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  form: {
    padding: 16,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    maxHeight: 100,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  categoryButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  glCodeContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  glCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
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
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});