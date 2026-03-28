import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useSession } from "@/hooks/session-store";
import { FileText, Calendar, DollarSign } from "lucide-react-native";


export default function HistoryScreen() {
  const { sessions } = useSession();
  
  const submittedSessions = sessions.filter(s => s.status === 'submitted');

  if (submittedSessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FileText size={64} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No History</Text>
        <Text style={styles.emptyText}>Submitted sessions will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.sessionsList}>
          {submittedSessions.map((session) => {
            const totalAmount = session.receipts.reduce((sum, r) => sum + parseFloat(r.cost || '0'), 0);
            const date = new Date(session.createdAt).toLocaleDateString();
            
            return (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionId}>Session #{session.id.slice(-6)}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Submitted</Text>
                  </View>
                </View>
                
                <View style={styles.sessionDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <FileText size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{session.receipts.length} receipts</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <DollarSign size={16} color="#6B7280" />
                    <Text style={styles.detailAmount}>${totalAmount.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
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
  },
  sessionsList: {
    padding: 16,
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
});