import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: string;
  paidBy: 'me' | 'partner' | 'split';
  settled: boolean;
  splitPercentage?: number; // if split, percentage I pay (default 50)
}

export default function ExpensesScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('groceries');
  const [paidBy, setPaidBy] = useState<'me' | 'partner' | 'split'>('me');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [
    { id: 'groceries', label: 'Groceries', icon: '🛒', color: '#50C878' },
    { id: 'dates', label: 'Dates', icon: '🍽️', color: '#FF6B9D' },
    { id: 'bills', label: 'Bills', icon: '💡', color: '#FFB347' },
    { id: 'entertainment', label: 'Fun', icon: '🎬', color: '#4A90E2' },
    { id: 'travel', label: 'Travel', icon: '✈️', color: '#9D6BFF' },
    { id: 'other', label: 'Other', icon: '💰', color: '#999' },
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const stored = await AsyncStorage.getItem('expenses');
      if (stored) {
        setExpenses(JSON.parse(stored));
      } else {
        // Initialize with mock data
        const mockExpenses: Expense[] = [
          { id: 1, title: 'Grocery Shopping', amount: 85.50, date: '2026-01-12', category: 'groceries', paidBy: 'me', settled: false },
          { id: 2, title: 'Dinner at Italian Place', amount: 120.00, date: '2026-01-10', category: 'dates', paidBy: 'partner', settled: false },
          { id: 3, title: 'Netflix Subscription', amount: 15.99, date: '2026-01-05', category: 'bills', paidBy: 'split', settled: true },
          { id: 4, title: 'Movie Tickets', amount: 30.00, date: '2026-01-08', category: 'entertainment', paidBy: 'me', settled: false },
          { id: 5, title: 'Gas for Road Trip', amount: 65.00, date: '2026-01-06', category: 'travel', paidBy: 'partner', settled: true },
        ];
        setExpenses(mockExpenses);
        await AsyncStorage.setItem('expenses', JSON.stringify(mockExpenses));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
      setExpenses(newExpenses);
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const handleAddExpense = async () => {
    if (expenseTitle.trim() && expenseAmount.trim() && !isNaN(Number(expenseAmount))) {
      const newExpense: Expense = {
        id: Date.now(),
        title: expenseTitle,
        amount: parseFloat(expenseAmount),
        date: new Date().toISOString().split('T')[0],
        category: selectedCategory,
        paidBy: paidBy,
        settled: false,
        splitPercentage: paidBy === 'split' ? 50 : undefined,
      };
      await saveExpenses([newExpense, ...expenses]);
      setModalVisible(false);
      setExpenseTitle('');
      setExpenseAmount('');
      setSelectedCategory('groceries');
      setPaidBy('me');
    }
  };

  const handleToggleSettled = async (id: number) => {
    const updated = expenses.map(e => e.id === id ? { ...e, settled: !e.settled } : e);
    await saveExpenses(updated);
  };

  const handleDeleteExpense = async (id: number) => {
    const updated = expenses.filter(e => e.id !== id);
    await saveExpenses(updated);
  };

  const calculateBalance = () => {
    let myTotal = 0;
    let partnerTotal = 0;

    expenses.filter(e => !e.settled).forEach(expense => {
      if (expense.paidBy === 'me') {
        // I paid, partner owes me half
        myTotal -= expense.amount / 2;
        partnerTotal += expense.amount / 2;
      } else if (expense.paidBy === 'partner') {
        // Partner paid, I owe them half
        partnerTotal -= expense.amount / 2;
        myTotal += expense.amount / 2;
      }
      // If split, already paid half each, no balance change
    });

    const balance = partnerTotal - myTotal;
    return balance;
  };

  const getCategoryData = (catId: string) => {
    return categories.find(c => c.id === catId) || categories[0];
  };

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter(e => e.category === filterCategory);

  const balance = calculateBalance();
  const monthlyTotal = expenses
    .filter(e => e.date.startsWith('2026-01'))
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E5F3FF', '#FFF5E5', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expenses</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={28} color="#50C878" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={[
            styles.balanceAmount,
            { color: balance === 0 ? '#50C878' : balance > 0 ? '#FF6B9D' : '#4A90E2' }
          ]}>
            ${Math.abs(balance).toFixed(2)}
          </Text>
          <Text style={styles.balanceText}>
            {balance === 0 ? 'All Settled Up! 🎉' : balance > 0 ? 'Partner owes you' : 'You owe partner'}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>${monthlyTotal.toFixed(2)}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{expenses.filter(e => !e.settled).length}</Text>
              <Text style={styles.statLabel}>Unsettled</Text>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              filterCategory === 'all' && styles.categoryChipActive,
            ]}
            onPress={() => setFilterCategory('all')}
          >
            <Text style={styles.categoryEmoji}>📊</Text>
            <Text style={[
              styles.categoryText,
              filterCategory === 'all' && styles.categoryTextActive,
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                filterCategory === cat.id && styles.categoryChipActive,
                { backgroundColor: filterCategory === cat.id ? cat.color : '#F8F9FA' }
              ]}
              onPress={() => setFilterCategory(cat.id)}
            >
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              <Text style={[
                styles.categoryText,
                filterCategory === cat.id && styles.categoryTextActive,
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Expenses List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {filteredExpenses.map((expense) => {
            const catData = getCategoryData(expense.category);
            return (
              <View
                key={expense.id}
                style={[
                  styles.expenseCard,
                  expense.settled && styles.expenseCardSettled
                ]}
              >
                <View style={[styles.categoryIndicator, { backgroundColor: catData.color }]}>
                  <Text style={styles.categoryIconText}>{catData.icon}</Text>
                </View>
                <View style={styles.expenseContent}>
                  <View style={styles.expenseHeader}>
                    <Text style={[styles.expenseTitle, expense.settled && styles.expenseTextSettled]}>
                      {expense.title}
                    </Text>
                    <Text style={[styles.expenseAmount, expense.settled && styles.expenseTextSettled]}>
                      ${expense.amount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.expenseDetails}>
                    <Text style={styles.expenseDate}>{expense.date}</Text>
                    <View style={styles.paidByBadge}>
                      <Text style={styles.paidByText}>
                        {expense.paidBy === 'me' ? '👤 You paid' : expense.paidBy === 'partner' ? '👥 Partner paid' : '🤝 Split'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.expenseActions}>
                  <TouchableOpacity
                    onPress={() => handleToggleSettled(expense.id)}
                    style={styles.actionButton}
                  >
                    <Ionicons
                      name={expense.settled ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={24}
                      color={expense.settled ? '#50C878' : '#999'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteExpense(expense.id)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF6B9D" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>

      {/* Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Expense</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="What was it for?"
              placeholderTextColor="#999"
              value={expenseTitle}
              onChangeText={setExpenseTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Amount ($)"
              placeholderTextColor="#999"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
              keyboardType="decimal-pad"
            />

            {/* Category Selector */}
            <Text style={styles.modalSectionTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalCategoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.modalCategoryChip,
                    selectedCategory === cat.id && { backgroundColor: cat.color },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.modalCategoryEmoji}>{cat.icon}</Text>
                  <Text style={[
                    styles.modalCategoryText,
                    selectedCategory === cat.id && { color: 'white' },
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Who Paid Selector */}
            <Text style={styles.modalSectionTitle}>Who Paid?</Text>
            <View style={styles.paidBySelector}>
              <TouchableOpacity
                style={[styles.paidByOption, paidBy === 'me' && styles.paidByOptionActive]}
                onPress={() => setPaidBy('me')}
              >
                <Ionicons name="person" size={24} color={paidBy === 'me' ? 'white' : '#666'} />
                <Text style={[styles.paidByLabel, paidBy === 'me' && { color: 'white' }]}>
                  I Paid
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paidByOption, paidBy === 'partner' && styles.paidByOptionActive]}
                onPress={() => setPaidBy('partner')}
              >
                <Ionicons name="people" size={24} color={paidBy === 'partner' ? 'white' : '#666'} />
                <Text style={[styles.paidByLabel, paidBy === 'partner' && { color: 'white' }]}>
                  Partner Paid
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paidByOption, paidBy === 'split' && styles.paidByOptionActive]}
                onPress={() => setPaidBy('split')}
              >
                <Ionicons name="git-compare" size={24} color={paidBy === 'split' ? 'white' : '#666'} />
                <Text style={[styles.paidByLabel, paidBy === 'split' && { color: 'white' }]}>
                  Split 50/50
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.addExpenseButton,
                (!expenseTitle.trim() || !expenseAmount.trim()) && styles.addExpenseButtonDisabled
              ]}
              onPress={handleAddExpense}
              disabled={!expenseTitle.trim() || !expenseAmount.trim()}
            >
              <Text style={styles.addExpenseButtonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#50C878',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  expenseCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  expenseCardSettled: {
    opacity: 0.6,
    backgroundColor: '#F8F9FA',
  },
  categoryIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 24,
  },
  expenseContent: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#50C878',
    marginLeft: 8,
  },
  expenseTextSettled: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  expenseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expenseDate: {
    fontSize: 12,
    color: '#999',
  },
  paidByBadge: {
    backgroundColor: '#E5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paidByText: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '600',
  },
  expenseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modalCategoryScroll: {
    flexGrow: 0,
    marginBottom: 24,
  },
  modalCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  modalCategoryEmoji: {
    fontSize: 18,
  },
  modalCategoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  paidBySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  paidByOption: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  paidByOptionActive: {
    backgroundColor: '#50C878',
  },
  paidByLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  addExpenseButton: {
    backgroundColor: '#50C878',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addExpenseButtonDisabled: {
    backgroundColor: '#CCC',
  },
  addExpenseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
