import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, TextInput, View, Image, SafeAreaView} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {colors, radius, space, type, shadow} from '../constants/theme';
import {medicineApi} from '../api/medicineApi';
import {ScreenState} from '../components/ScreenState';
import {useCart} from '../store/CartContext';

export function MedicinesScreen() {
  const nav = useNavigation();
  const {params} = useRoute();
  const shop = params?.shop;
  const {items, addItem, removeItem, total, count} = useCart();
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await medicineApi.search({shopId: shop?.id, q});
      setRows(data.medicines || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [shop?.id, q]);

  useEffect(() => { load(); }, [load]);

  const renderMedicineItem = ({item}) => {
    const cartItem = items[item.id];
    return (
      <View style={styles.medicineCard}>
        <Image source={{uri: item.imageUrl}} style={styles.medImage} />
        <View style={styles.medDetails}>
          <Text style={styles.medName}>{item.name}</Text>
          <Text style={styles.medGeneric}>{item.genericName}</Text>
          <Text style={styles.medStrength}>{item.strength} · {item.packSize}</Text>
          <Text style={styles.priceText}>₹{item.unitPrice}</Text>
        </View>
        <View style={styles.medActions}>
          {cartItem ? (
            <View style={styles.qtyControls}>
              <Pressable onPress={() => removeItem(item.id)} style={styles.qtyBtn}><Text>-</Text></Pressable>
              <Text style={styles.qtyText}>{cartItem.qty}</Text>
              <Pressable onPress={() => addItem(item, shop)} style={styles.qtyBtn}><Text>+</Text></Pressable>
            </View>
          ) : (
            <Pressable onPress={() => addItem(item, shop)} style={styles.addBtn}><Text style={styles.addText}>Add</Text></Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => nav.goBack()}><Text style={styles.back}>←</Text></Pressable>
        {shop?.imageUrl && <Image source={{uri: shop?.imageUrl}} style={styles.shopImage} />}
        <View style={styles.shopInfo}>
          <Text style={styles.shopName} numberOfLines={1}>{shop?.name} ✓</Text>
          <Text style={styles.shopMetadata}>{shop?.address}</Text>
          <Text style={styles.openStatus}>{shop?.open ? 'Open Now' : 'Closed'}</Text>
        </View>
        <View style={styles.headerIcons}>
          <Text>🤍</Text>
          <Text>↗</Text>
        </View>
      </View>
      
      <TextInput value={q} onChangeText={setQ} placeholder="Search for medicines, healthcare products..." style={styles.searchBar} />

      <ScreenState loading={loading} error={error} empty={rows.length === 0} onRetry={load}>
        <FlatList
          data={rows}
          keyExtractor={i => i.id.toString()}
          renderItem={renderMedicineItem}
          contentContainerStyle={styles.listContainer}
        />
      </ScreenState>

      {count > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartContent}>
            <Text style={styles.cartCount}>{count}</Text>
            <View>
              <Text style={styles.cartTotal}>₹{total}</Text>
              <Text style={styles.cartItems}>{count} items</Text>
            </View>
          </View>
          <Pressable style={styles.viewCartBtn} onPress={() => nav.navigate('Cart', {shop})}>
            <Text style={styles.btnText}>View Cart →</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F8FBF8'},
  header: {flexDirection: 'row', alignItems: 'center', padding: space.md, backgroundColor: '#FFF', gap: 10},
  back: {fontSize: 24},
  shopImage: {width: 50, height: 50, borderRadius: 8},
  shopInfo: {flex: 1},
  shopName: {fontWeight: '700', fontSize: 16},
  shopMetadata: {fontSize: 12, color: '#666'},
  openStatus: {fontSize: 12, color: 'green'},
  headerIcons: {flexDirection: 'row', gap: 10},
  searchBar: {margin: space.md, backgroundColor: '#FFF', padding: 14, borderRadius: 30, borderWidth: 1, borderColor: '#EEE'},
  listContainer: {paddingHorizontal: space.md, paddingBottom: 100},
  medicineCard: {flexDirection: 'row', backgroundColor: '#FFF', padding: 10, borderRadius: 12, marginBottom: 10, alignItems: 'center', ...shadow},
  medImage: {width: 60, height: 60, marginRight: 10},
  medDetails: {flex: 1},
  medName: {fontWeight: '700'},
  medGeneric: {fontSize: 12, color: '#888'},
  medStrength: {fontSize: 12, color: '#888'},
  priceText: {fontWeight: '700', marginTop: 5},
  medActions: {justifyContent: 'center'},
  qtyControls: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 8},
  qtyBtn: {padding: 10},
  qtyText: {fontWeight: '700', paddingHorizontal: 10},
  addBtn: {paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#006400', borderRadius: 8},
  addText: {color: '#FFF', fontWeight: '700'},
  cartBar: {position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#004d00', padding: 15, borderRadius: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cartContent: {flexDirection: 'row', alignItems: 'center', gap: 10},
  cartCount: {color: '#004d00', fontWeight: '700', fontSize: 18, backgroundColor: '#FFF', paddingHorizontal: 10, borderRadius: 15},
  cartTotal: {color: '#FFF', fontWeight: '700', fontSize: 16},
  cartItems: {color: '#DDD', fontSize: 12},
  viewCartBtn: {paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FFF', borderRadius: 20},
  btnText: {color: '#004d00', fontWeight: '700'},
});
