import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Modal, TextInput } from "react-native";
import { useSession } from "@/hooks/session-store";
import { Camera, Plus, Send, Trash2, Edit, X } from "lucide-react-native";
import { router } from "expo-router";
import { useState } from "react";

export default function CurrentSessionScreen() {
  const { currentSession, deleteReceipt, submitSession } = useSession();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNoSessionModal, setShowNoSessionModal] = useState(false);
  const [email, setEmail] = useState('');
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);

  const handleStartSession = () => {
    router.push('/start-session');
  };

  const handleAddReceipt = () => {
    if (!currentSession) {
      setShowNoSessionModal(true);
      return;
    }
    router.push('/camera');
  };

  const handleSubmitSession = () => {
    setShowSubmitModal(true);
  };

  const handleSubmitConfirm = () => {
    const trimmedEmail = email.trim();
    if (trimmedEmail && trimmedEmail.length <= 100) {
      submitSession(trimmedEmail);
      setShowSubmitModal(false);
      setEmail('');
    }
  };

  const handleEditReceipt = (receiptId: string) => {
    router.push({
      pathname: '/receipt-details',
      params: { receiptId, mode: 'edit' }
    });
  };

  const handleDeleteReceipt = (receiptId: string) => {
    setReceiptToDelete(receiptId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (receiptToDelete) {
      deleteReceipt(receiptToDelete);
      setReceiptToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const totalAmount = currentSession?.receipts.reduce((sum, r) => sum + parseFloat(r.cost || '0'), 0) || 0;

  if (!currentSession) {
    return (
      <>
        <View style={styles.emptyContainer}>
          <Camera size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Active Session</Text>
          <Text style={styles.emptyText}>Start a new session to begin capturing receipts</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start New Session</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showNoSessionModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>No Active Session</Text>
              <Text style={styles.modalText}>Please start a new session first</Text>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => setShowNoSessionModal(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.sessionHeader}>
            <View>
              <Text style={styles.sessionTitle}>Active Session</Text>
              {currentSession.userInfo && (
                <Text style={styles.sessionUser}>
                  {currentSession.userInfo.firstName} {currentSession.userInfo.lastName} • {currentSession.userInfo.location} • {currentSession.userInfo.sessionId}
                </Text>
              )}
              <Text style={styles.sessionInfo}>
                {currentSession.receipts.length} receipt{currentSession.receipts.length !== 1 ? 's' : ''} • ${totalAmount.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddReceipt}>
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Receipt</Text>
            </TouchableOpacity>
          </View>

          {currentSession.receipts.length === 0 ? (
            <View style={styles.noReceipts}>
              <Text style={styles.noReceiptsText}>No receipts yet</Text>
              <Text style={styles.noReceiptsSubtext}>Tap &ldquo;Add Receipt&rdquo; to capture your first receipt</Text>
            </View>
          ) : (
            <View style={styles.receiptsList}>
              {currentSession.receipts.map((receipt) => (
                <View key={receipt.id} style={styles.receiptCard}>
                  <View style={styles.receiptContent}>
                    {receipt.imageUri && (
                      <Image source={{ uri: receipt.imageUri }} style={styles.receiptThumbnail} />
                    )}
                    <View style={styles.receiptInfo}>
                      <Text style={styles.receiptDescription} numberOfLines={1}>
                        {receipt.description || 'No description'}
                      </Text>
                      <Text style={styles.receiptDetails}>
                        {receipt.date} • {receipt.category}
                      </Text>
                      <Text style={styles.receiptAmount}>${receipt.cost}</Text>
                    </View>
                  </View>
                  <View style={styles.receiptActions}>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => handleEditReceipt(receipt.id)}
                    >
                      <Edit size={18} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={() => handleDeleteReceipt(receipt.id)}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {currentSession.receipts.length > 0 && (
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitSession}>
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={showSubmitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Session</Text>
              <TouchableOpacity onPress={() => setShowSubmitModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>Enter email address to send the expense report:</Text>
            <TextInput
              style={styles.modalInput}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowSubmitModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitButton} 
                onPress={handleSubmitConfirm}
              >
                <Text style={styles.modalSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Receipt</Text>
            <Text style={styles.modalText}>Are you sure you want to delete this receipt?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalDeleteButton} 
                onPress={handleDeleteConfirm}
              >
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  sessionUser: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 2,
    fontWeight: '500',
  },
  sessionInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noReceipts: {
    alignItems: 'center',
    padding: 40,
  },
  noReceiptsText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
  },
  noReceiptsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  receiptsList: {
    padding: 16,
    gap: 12,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  receiptContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  receiptThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  receiptInfo: {
    flex: 1,
  },
  receiptDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  receiptDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  receiptAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 4,
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  modalCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#10B981',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#EF4444',
  },
  modalDeleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});