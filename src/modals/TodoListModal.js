import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, ScrollView, Platform } from 'react-native';

// Helper to get 7 days from now (including today)
function get7DayStrings() {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 7; ++i) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d.toISOString().slice(0, 10)); // "YYYY-MM-DD"
  }
  return days;
}

export default function TodoListModal({ visible, onClose, todos, setTodos }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [apply7, setApply7] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const days = get7DayStrings();

  // Đảm bảo selectedDate được reset về hôm nay khi mở modal
  useEffect(() => {
    if (visible) setSelectedDate(new Date().toISOString().slice(0, 10));
  }, [visible]);

  // Cập nhật todos trong setTodos và lưu luôn vào AsyncStorage
  const updateTodos = (newTodos) => {
    setTodos((old) => {
      // Giữ nguyên tham chiếu nếu không đổi để tránh render lại không cần thiết
      if (JSON.stringify(old) === JSON.stringify(newTodos)) return old;
      return newTodos;
    });
  };

  // Filter tasks for selectedDate
  const todayTasks = (todos && todos[selectedDate]) ? todos[selectedDate] : [];

  const handleAdd = () => {
    if (!newTask.trim()) return;
    let newTodos = { ...todos };
    if (apply7) {
      days.forEach(day => {
        if (!newTodos[day]) newTodos[day] = [];
        newTodos[day] = [
          ...newTodos[day],
          { id: Date.now() + Math.random(), text: newTask, done: false }
        ];
      });
    } else {
      if (!newTodos[selectedDate]) newTodos[selectedDate] = [];
      newTodos[selectedDate] = [
        ...newTodos[selectedDate],
        { id: Date.now() + Math.random(), text: newTask, done: false }
      ];
    }
    updateTodos(newTodos);
    setNewTask('');
    setApply7(false);
    setShowAdd(false);
  };

  const toggleDone = (id) => {
    let newTodos = { ...todos };
    newTodos[selectedDate] = newTodos[selectedDate].map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    updateTodos(newTodos);
  };

  const handleDelete = (id) => {
    let newTodos = { ...todos };
    newTodos[selectedDate] = newTodos[selectedDate].filter(task => task.id !== id);
    updateTodos(newTodos);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: '#232338', padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onClose}><Text style={{ color: '#39ff14', fontWeight: 'bold', fontSize: 18 }}>←</Text></TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', color: '#39ff14', fontSize: 19, fontWeight: 'bold' }}>Việc cần làm trong ngày</Text>
          <TouchableOpacity onPress={() => setShowAdd(v => !v)}>
            <Text style={{ color: '#ffe46b', fontSize: 16 }}>{showAdd ? 'Đóng' : '+ Thêm'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal style={{ marginVertical: 12, flexGrow: 0 }}>
          {days.map(day =>
            <TouchableOpacity
              key={day}
              style={[styles.dayBtn, selectedDate === day && styles.dayBtnActive]}
              onPress={() => setSelectedDate(day)}
            >
              <Text style={selectedDate === day ? styles.dayTxtActive : styles.dayTxt}>
                {new Date(day).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        {showAdd && (
          <View style={{ backgroundColor: '#181829', borderRadius: 9, marginVertical: 12, padding: 10 }}>
            <TextInput
              style={styles.input}
              value={newTask}
              onChangeText={setNewTask}
              placeholder="Nhập việc cần làm"
              placeholderTextColor="#aaa"
            />
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <TouchableOpacity onPress={() => setApply7(!apply7)} style={{ marginRight: 8 }}>
                <View style={[styles.checkbox, apply7 && styles.checkboxChecked]}>{apply7 ? <Text style={{ color: "#181829" }}>✓</Text> : null}</View>
              </TouchableOpacity>
              <Text style={{ color: "#ffe46b" }}>Áp dụng cho 7 ngày tiếp theo</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={{ color: '#181829', fontWeight: 'bold' }}>Lưu việc</Text>
            </TouchableOpacity>
          </View>
        )}
        <FlatList
          data={todayTasks}
          keyExtractor={item => item.id + ''}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              <TouchableOpacity onPress={() => toggleDone(item.id)}>
                <View style={[styles.checkbox, item.done && styles.checkboxChecked]}>
                  {item.done ? <Text style={{ color: "#181829" }}>✓</Text> : null}
                </View>
              </TouchableOpacity>
              <Text style={[styles.taskText, item.done && { textDecorationLine: "line-through", color: "#aaa" }]}>
                {item.text}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={{ color: '#ff003c', marginLeft: 10, fontWeight: 'bold' }}>X</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#aaa', marginTop: 24, textAlign: 'center' }}>Không có công việc nào.</Text>}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: '#29293e', borderRadius: 6, color: '#fff', padding: 8, marginBottom: 6 },
  addBtn: { backgroundColor: '#39ff14', borderRadius: 8, padding: 10, marginTop: 8, alignItems: 'center' },
  taskItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#29293e", borderRadius: 7, marginVertical: 7, padding: 10 },
  taskText: { color: '#ffe46b', flex: 1, marginLeft: 10, fontSize: 15 },
  checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: "#ffe46b", alignItems: "center", justifyContent: "center", backgroundColor: "#232338" },
  checkboxChecked: { backgroundColor: "#ffe46b", borderColor: "#ffe46b" },
  dayBtn: { paddingHorizontal: 14, paddingVertical: 8, marginHorizontal: 4, backgroundColor: "#29293e", borderRadius: 8 },
  dayBtnActive: { backgroundColor: "#39ff14" },
  dayTxt: { color: "#ffe46b", fontWeight: "bold" },
  dayTxtActive: { color: "#181829", fontWeight: "bold" },
});