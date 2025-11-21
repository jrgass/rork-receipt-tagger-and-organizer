import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Receipt, Session, SessionUserInfo } from '@/types/receipt';
import { Linking, Platform } from 'react-native';
import { Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as MailComposer from 'expo-mail-composer';
import * as Sharing from 'expo-sharing';

// Storage provider for AsyncStorage operations
const useStorage = () => {
  const setItem = async (key: string, value: string) => {
    if (!key?.trim() || key.length > 100) return;
    if (!value?.trim() || value.length > 10000) return;
    
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.default.setItem(key.trim(), value.trim());
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  const getItem = async (key: string) => {
    if (!key?.trim() || key.length > 100) return null;
    
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return await AsyncStorage.default.getItem(key.trim());
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  };

  return { setItem, getItem };
};

export const [SessionProvider, useSession] = createContextHook(() => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const storage = useStorage();

  // Load sessions from storage
  const loadSessions = useCallback(async () => {
    try {
      const stored = await storage.getItem('sessions');
      if (stored) {
        const parsedSessions = JSON.parse(stored);
        setSessions(parsedSessions);
        
        // Find active session
        const activeSession = parsedSessions.find((s: Session) => s.status === 'active');
        if (activeSession) {
          setCurrentSession(activeSession);
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);



  const saveSessions = useCallback(async (updatedSessions: Session[]) => {
    try {
      if (Array.isArray(updatedSessions) && updatedSessions.length <= 1000) {
        const sanitizedSessions = updatedSessions.filter(s => s && s.id);
        await storage.setItem('sessions', JSON.stringify(sanitizedSessions));
        setSessions(sanitizedSessions);
      }
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }, [storage]);

  const startNewSession = useCallback((userInfo?: SessionUserInfo) => {
    const newSession: Session = {
      id: Date.now().toString(),
      receipts: [],
      createdAt: Date.now(),
      status: 'active',
      userInfo,
    };
    
    setCurrentSession(newSession);
    const updatedSessions = [...sessions, newSession];
    saveSessions(updatedSessions);
  }, [sessions, saveSessions]);

  const addReceipt = useCallback((receipt: Receipt) => {
    if (!currentSession) return;
    
    const updatedSession = {
      ...currentSession,
      receipts: [...currentSession.receipts, receipt],
    };
    
    setCurrentSession(updatedSession);
    
    const updatedSessions = sessions.map(s => 
      s.id === currentSession.id ? updatedSession : s
    );
    saveSessions(updatedSessions);
  }, [currentSession, sessions, saveSessions]);

  const updateReceipt = useCallback((receiptId: string, updates: Partial<Receipt>) => {
    if (!currentSession) return;
    
    const updatedSession = {
      ...currentSession,
      receipts: currentSession.receipts.map(r => 
        r.id === receiptId ? { ...r, ...updates } : r
      ),
    };
    
    setCurrentSession(updatedSession);
    
    const updatedSessions = sessions.map(s => 
      s.id === currentSession.id ? updatedSession : s
    );
    saveSessions(updatedSessions);
  }, [currentSession, sessions, saveSessions]);

  const deleteReceipt = useCallback((receiptId: string) => {
    if (!currentSession) return;
    
    const updatedSession = {
      ...currentSession,
      receipts: currentSession.receipts.filter(r => r.id !== receiptId),
    };
    
    setCurrentSession(updatedSession);
    
    const updatedSessions = sessions.map(s => 
      s.id === currentSession.id ? updatedSession : s
    );
    saveSessions(updatedSessions);
  }, [currentSession, sessions, saveSessions]);



  const submitSession = useCallback(async (emailAddress: string) => {
    if (!currentSession || currentSession.receipts.length === 0) {
      throw new Error('No receipts to submit');
    }

    try {
      // Format session data for email
      const sessionDate = new Date(currentSession.createdAt).toLocaleDateString();
      const totalAmount = currentSession.receipts.reduce((sum, r) => sum + parseFloat(r.cost || '0'), 0);
      
      let emailBody = `Expense Report - Session ${currentSession.id}\n`;
      emailBody += `Date: ${sessionDate}\n`;
      emailBody += `Total Receipts: ${currentSession.receipts.length}\n`;
      emailBody += `Total Amount: ${totalAmount.toFixed(2)}\n\n`;
      
      if (currentSession.userInfo) {
        emailBody += `Submitted by: ${currentSession.userInfo.firstName} ${currentSession.userInfo.lastName}\n`;
        emailBody += `Location: ${currentSession.userInfo.location}\n`;
        emailBody += `Session ID: ${currentSession.userInfo.sessionId}\n\n`;
      }
      
      emailBody += `Receipt Details:\n`;
      emailBody += `================\n\n`;
      
      currentSession.receipts.forEach((receipt, index) => {
        emailBody += `Receipt ${index + 1}:\n`;
        emailBody += `Date: ${receipt.date}\n`;
        emailBody += `Description: ${receipt.description}\n`;
        emailBody += `Purpose: ${receipt.purpose}\n`;
        emailBody += `Category: ${receipt.category}\n`;
        emailBody += `GL Code: ${receipt.glCode}\n`;
        emailBody += `Cost: ${receipt.cost}\n`;
        emailBody += `---\n\n`;
      });

      const subject = `Expense Report - ${sessionDate} - ${totalAmount.toFixed(2)}`;
      
      // Create attachments array with receipt images
      const attachments: string[] = [];
      
      // Copy receipt images to a temporary directory and collect them
      for (let i = 0; i < currentSession.receipts.length; i++) {
        const receipt = currentSession.receipts[i];
        if (receipt.imageUri) {
          try {
            // Create a filename for the receipt image
            const fileName = `receipt_${i + 1}_${receipt.description.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
            const tempPath = `${Paths.document.uri}temp_${fileName}`;
            
            // Copy the image to a temporary location
            await FileSystemLegacy.copyAsync({
              from: receipt.imageUri,
              to: tempPath
            });
            
            attachments.push(tempPath);
          } catch (error) {
            console.warn(`Failed to prepare attachment for receipt ${i + 1}:`, error);
          }
        }
      }
      
      // Create a summary text file
      const summaryFileName = `expense_report_${currentSession.id}.txt`;
      const summaryPath = `${Paths.document.uri}${summaryFileName}`;
      
      await FileSystemLegacy.writeAsStringAsync(summaryPath, emailBody);
      attachments.push(summaryPath);
      
      // Check if MailComposer is available (native platforms)
      const isMailAvailable = await MailComposer.isAvailableAsync();
      
      if (isMailAvailable && Platform.OS !== 'web') {
        // Use MailComposer for native platforms
        const result = await MailComposer.composeAsync({
          recipients: [emailAddress],
          subject: subject,
          body: emailBody,
          attachments: attachments,
        });
        
        if (result.status === 'sent') {
          console.log('Email sent successfully');
        } else if (result.status === 'cancelled') {
          throw new Error('Email was cancelled');
        }
      } else {
        // Fallback: Use sharing for web or if mail composer is not available
        if (attachments.length > 0) {
          // Share the summary file
          await Sharing.shareAsync(summaryPath, {
            mimeType: 'text/plain',
            dialogTitle: 'Share Expense Report'
          });
        } else {
          // Fallback to mailto URL
          const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
          const canOpen = await Linking.canOpenURL(mailtoUrl);
          if (canOpen) {
            await Linking.openURL(mailtoUrl);
          } else {
            throw new Error('Unable to open email client');
          }
        }
      }
      
      // Clean up temporary files
      for (const attachment of attachments) {
        try {
          await FileSystemLegacy.deleteAsync(attachment, { idempotent: true });
        } catch (error) {
          console.warn('Failed to clean up temporary file:', attachment, error);
        }
      }
      
      // Mark session as submitted
      const updatedSession = { ...currentSession, status: 'submitted' as const };
      const updatedSessions = sessions.map(s => 
        s.id === currentSession.id ? updatedSession : s
      );
      saveSessions(updatedSessions);
      setCurrentSession(null);
      
    } catch (error) {
      console.error('Error submitting session:', error);
      throw error;
    }
  }, [currentSession, sessions, saveSessions]);



  const endSession = useCallback(() => {
    if (!currentSession) return;
    
    const updatedSession = { ...currentSession, status: 'submitted' as const };
    const updatedSessions = sessions.map(s => 
      s.id === currentSession.id ? updatedSession : s
    );
    saveSessions(updatedSessions);
    setCurrentSession(null);
  }, [currentSession, sessions, saveSessions]);

  const contextValue = useMemo(() => ({
    currentSession,
    sessions,
    isLoading,
    startNewSession,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    submitSession,
    endSession,
  }), [
    currentSession,
    sessions,
    isLoading,
    startNewSession,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    submitSession,
    endSession,
  ]);

  return contextValue;
});

