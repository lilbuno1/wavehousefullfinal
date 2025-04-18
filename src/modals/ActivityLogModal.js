import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function ActivityLogModal({ visible, onClose, activityLog = [] }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>📜 Log hoạt động</Text>
          <ScrollView style={styles.logList}>
            {activityLog.length === 0 && (
              <Text style={styles.emptyText}>Chưa có log hoạt động nào.</Text>
            )}
            {activityLog.map((log, idx) => (
              <View key={idx} style={styles.logItem}>
                <Text style={styles.time}>{log.time}</Text>
                <Text style={styles.action}>{log.text}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>ĐÓNG</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#000b", justifyContent: "center", alignItems: "center" },
  container: {
    backgroundColor: "#181829",
    borderRadius: 18,
    width: "90%",
    padding: 22,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#232338"
  },
  title: {
    color: "#39ff14",
    fontWeight: "bold",
    fontSize: 26,
    marginBottom: 18,
    letterSpacing: 1,
    textShadowColor: '#0f0',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6
  },
  logList: {
    maxHeight: 350,
    marginBottom: 12,
    width: '100%'
  },
  logItem: {
    marginBottom: 14,
    backgroundColor: "#232338",
    borderRadius: 10,
    padding: 13,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: "#39ff14",
    shadowColor: "#39ff14",
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },
  time: {
    fontWeight: 'bold',
    color: "#ffe46b",
    marginBottom: 2,
    fontSize: 14,
    letterSpacing: 0.2
  },
  action: {
    color: "#fff",
    fontSize: 17,
    marginBottom: 2
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#aaa',
    textAlign: 'center',
    marginTop: 18
  },
  closeBtn: {
    backgroundColor: "#ffe46b44",
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8
  },
  closeBtnText: {
    color: "#ff003c",
    fontWeight: "bold",
    fontSize: 19,
    letterSpacing: 1
  }
});