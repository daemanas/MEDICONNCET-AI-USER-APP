import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, radius, shadow, space, type} from '../constants/theme';
import {useCart} from '../store/CartContext';
import {useSession} from '../store/SessionContext';
import {formatLocationLabel} from '../location/locationService';

function formatCurrency(value) {
  const num = Number(value || 0);
  return `₹${Number.isInteger(num) ? num.toLocaleString('en-IN') : num.toLocaleString('en-IN', {maximumFractionDigits: 2})}`;
}

function ProductImage({imageUrl, name}) {
  const source = imageUrl ? {uri: imageUrl} : null;
  if (!source) {
    return (
      <View style={styles.productPlaceholder}>
        <Text style={styles.productPlaceholderText}>{String(name || 'M').slice(0, 1).toUpperCase()}</Text>
      </View>
    );
  }

  return <Image source={source} style={styles.productImage} resizeMode="contain" />;
}

export function CartScreen() {
  const nav = useNavigation();
  const {items, total, count, clearCart, deleteItem, updateQuantity, shop} = useCart();
  const {ready, patient} = useSession();
  const [busy, setBusy] = useState(false);

  const itemList = useMemo(() => Object.values(items || {}), [items]);

  const subtotal = useMemo(
    () => itemList.reduce((sum, item) => sum + Number(item.unitPrice || item.price || 0) * Number(item.qty || 0), 0),
    [itemList],
  );

  const discount = useMemo(
    () =>
      itemList.reduce((sum, item) => {
        const price = Number(item.unitPrice || item.price || 0);
        const original = Number(item.originalPrice || item.mrp || 0);
        const qty = Number(item.qty || 0);
        return sum + Math.max(original - price, 0) * qty;
      }, 0),
    [itemList],
  );

  const deliveryCharge = useMemo(() => {
    const source = shop?.deliveryCharge ?? shop?.deliveryFee ?? shop?.shippingCharge ?? 0;
    return Number(source || 0);
  }, [shop]);

  const totalAmount = Math.max(subtotal - discount + deliveryCharge, 0);

  const addressText = patient?.address || formatLocationLabel(patient) || 'Add a delivery address';
  const pharmacy = shop || itemList[0]?.pharmacy || null;

  const handleClearCart = () => {
    Alert.alert('Clear cart', 'Remove all medicines from your cart?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Clear Cart', style: 'destructive', onPress: clearCart},
    ]);
  };

  const handleAddMore = () => {
    if (pharmacy) {
      nav.navigate('Medicines', {shop: pharmacy});
      return;
    }
    nav.navigate('MedicalShops');
  };

  const handleContinueShopping = () => {
    if (pharmacy) {
      nav.navigate('Medicines', {shop: pharmacy});
      return;
    }
    nav.navigate('MedicalShops');
  };

  const handlePlaceOrder = () => {
    if (!itemList.length) {
      return;
    }
    setBusy(true);
    nav.navigate('Checkout', {pharmacy, items: itemList.map(item => ({
      ...item,
      medicineItemId: item.medicineItemId || item.id,
      qty: item.qty,
      quantity: item.qty,
      price: item.unitPrice || item.price,
      unitPrice: item.unitPrice || item.price,
    }))});
    setBusy(false);
  };

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[type.muted, styles.loadingText]}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!itemList.length) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => nav.goBack()} hitSlop={12}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={{flex: 1}} />
        </View>

        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add medicines and healthcare products to continue.</Text>
          <Pressable style={styles.primaryAction} onPress={handleAddMore}>
            <Text style={styles.primaryActionText}>Browse Medicines</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => nav.goBack()} hitSlop={12}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <Text style={styles.headerSubtitle}>Review your medicines and place the order</Text>
          </View>
          <Pressable style={styles.clearBtn} onPress={handleClearCart}>
            <Text style={styles.clearIcon}>🗑</Text>
            <Text style={styles.clearText}>Clear Cart</Text>
          </Pressable>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <Text style={styles.bannerIcon}>🛒</Text>
          </View>
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>You&apos;re one step closer to better health!</Text>
            <Text style={styles.bannerSubtitle}>Review your items and proceed to checkout.</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.sectionTitle}>{count} Items in your cart</Text>
          <Pressable onPress={handleContinueShopping}>
            <Text style={styles.continueText}>Continue Shopping →</Text>
          </Pressable>
        </View>

        {itemList.map(item => {
          const price = Number(item.unitPrice || item.price || 0);
          const original = Number(item.originalPrice || item.mrp || 0);
          const hasDiscount = original > price;
          const itemTotal = price * Number(item.qty || 0);

          return (
            <View key={item.id} style={styles.cartCard}>
              <View style={styles.productCardContent}>
                <ProductImage imageUrl={item.imageUrl || item.image || item.photo} name={item.name} />

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productMeta}>{item.genericName || item.generic || ''}</Text>
                  <Text style={styles.productMeta}>{item.strength || ''}{item.strength && item.packSize ? ' · ' : ''}{item.packSize || ''}</Text>
                  <Text style={styles.productMeta}>{item.dosageForm || item.form || ''}</Text>
                  <Text style={styles.productMeta}>{item.category || item.type || ''}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceCurrent}>{formatCurrency(price)}</Text>
                    {hasDiscount ? <Text style={styles.priceOriginal}>{formatCurrency(original)}</Text> : null}
                    {hasDiscount ? <Text style={styles.discountBadge}> {Math.round(((original - price) / original) * 100) || 0}% OFF</Text> : null}
                  </View>
                </View>

                <View style={styles.rightPanel}>
                  <View style={styles.qtyWrap}>
                    <Pressable style={styles.qtyButton} onPress={() => updateQuantity(item.id, -1)}>
                      <Text style={styles.qtyText}>−</Text>
                    </Pressable>
                    <Text style={styles.qtyValue}>{Number(item.qty || 0)}</Text>
                    <Pressable style={styles.qtyButton} onPress={() => updateQuantity(item.id, 1)}>
                      <Text style={styles.qtyText}>+</Text>
                    </Pressable>
                  </View>
                  <Pressable style={styles.deleteButton} onPress={() => deleteItem(item.id)}>
                    <Text style={styles.deleteIcon}>🗑</Text>
                  </Pressable>
                  <Text style={styles.itemTotal}>{formatCurrency(itemTotal)}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.ctaRow}>
          <View style={styles.ctaLeft}>
            <Text style={styles.ctaIcon}>🧴</Text>
            <View>
              <Text style={styles.ctaTitle}>Need something else?</Text>
              <Text style={styles.ctaSubtitle}>Add more medicines, healthcare products or see suggestions.</Text>
            </View>
          </View>
          <Pressable style={styles.addMoreBtn} onPress={handleAddMore}>
            <Text style={styles.addMoreIcon}>＋</Text>
            <Text style={styles.addMoreText}>Add More Items</Text>
          </Pressable>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Text style={styles.infoIcon}>🏷️</Text>
            <View>
              <Text style={styles.infoTitle}>Apply Coupon</Text>
              <Text style={styles.infoSubtitle}>Get discounts on your order</Text>
            </View>
          </View>
          <Pressable>
            <Text style={styles.infoAction}>Apply →</Text>
          </Pressable>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.addressBlock}>
              <Text style={styles.infoTitle}>Delivery Address</Text>
              <Text style={styles.addressText} numberOfLines={2}>{addressText}</Text>
            </View>
          </View>
          <Pressable onPress={() => nav.navigate('LocationPicker')}>
            <Text style={styles.infoAction}>Change →</Text>
          </Pressable>
        </View>

        <Text style={styles.summaryHeading}>Order Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRowLine}>
            <Text style={styles.summaryLabel}>Items Total ({count} items)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRowLine}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.summaryValueDiscount}>- {formatCurrency(discount)}</Text>
          </View>
          <View style={styles.summaryRowLine}>
            <Text style={styles.summaryLabel}>Delivery Charge</Text>
            <Text style={styles.summaryValue}>{deliveryCharge > 0 ? formatCurrency(deliveryCharge) : 'FREE'}</Text>
          </View>
          <View style={[styles.summaryRowLine, styles.summaryTotalRow]}>
            <Text style={styles.summaryLabelBold}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.trustBar}>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>Safe & Secure Payment</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>Genuine Medicines</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>On-time Delivery</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutBar}>
        <View style={styles.checkoutLeft}>
          <Text style={styles.checkoutTotal}>{formatCurrency(totalAmount)}</Text>
          <Text style={styles.checkoutCount}>{count} items</Text>
        </View>
        <Pressable style={styles.checkoutBtn} onPress={handlePlaceOrder} disabled={busy}>
          <Text style={styles.checkoutBtnText}>Place Order →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bg},
  content: {paddingHorizontal: space.md, paddingBottom: 120, paddingTop: 6},
  headerRow: {flexDirection: 'row', alignItems: 'center', marginBottom: space.md, gap: 8},
  headerTextWrap: {flex: 1, marginTop: 4},
  backIcon: {fontSize: 32, color: colors.text, fontWeight: '600'},
  headerTitle: {fontSize: 34, fontWeight: '800', color: colors.text, letterSpacing: -0.5},
  headerSubtitle: {fontSize: 14, color: colors.textMuted, marginTop: 2},
  clearBtn: {flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoft, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10},
  clearIcon: {fontSize: 18},
  clearText: {fontSize: 13, color: colors.primaryDark, fontWeight: '700'},
  banner: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#DFF1E7', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#C7E7D5', marginBottom: space.md},
  bannerIconWrap: {width: 42, height: 42, borderRadius: 12, backgroundColor: '#E8F7EE', alignItems: 'center', justifyContent: 'center', marginRight: 12},
  bannerIcon: {fontSize: 22},
  bannerTextWrap: {flex: 1},
  bannerTitle: {fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 3},
  bannerSubtitle: {fontSize: 13, color: colors.textMuted},
  summaryRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10},
  sectionTitle: {fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.3},
  continueText: {fontSize: 16, fontWeight: '700', color: colors.primaryDark},
  cartCard: {backgroundColor: colors.surface, borderRadius: 18, padding: 10, borderWidth: 1, borderColor: colors.border, marginBottom: 12, ...shadow},
  productCardContent: {flexDirection: 'row', alignItems: 'center', gap: 12},
  productImage: {width: 90, height: 90, borderRadius: 16, backgroundColor: '#F2F7F6'},
  productPlaceholder: {width: 90, height: 90, borderRadius: 16, backgroundColor: '#E7F5EE', alignItems: 'center', justifyContent: 'center'},
  productPlaceholderText: {fontSize: 28, fontWeight: '700', color: colors.primaryDark},
  productInfo: {flex: 1, minWidth: 0},
  productName: {fontSize: 18, fontWeight: '800', color: colors.text},
  productMeta: {fontSize: 12, color: colors.textMuted, marginTop: 4},
  priceRow: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 8, gap: 8},
  priceCurrent: {fontSize: 16, fontWeight: '800', color: colors.text},
  priceOriginal: {fontSize: 12, color: colors.textSoft, textDecorationLine: 'line-through'},
  discountBadge: {fontSize: 11, fontWeight: '700', backgroundColor: '#FDE9E7', color: '#D45746', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden'},
  rightPanel: {alignItems: 'center', justifyContent: 'center', minWidth: 92},
  qtyWrap: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9F5EE', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 4},
  qtyButton: {width: 28, height: 28, borderRadius: 8, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center'},
  qtyText: {fontSize: 20, fontWeight: '700', color: colors.primaryDark},
  qtyValue: {fontSize: 18, fontWeight: '700', color: colors.text, minWidth: 28, textAlign: 'center'},
  deleteButton: {marginTop: 8, width: 36, height: 36, borderRadius: 10, backgroundColor: '#E9F5EE', alignItems: 'center', justifyContent: 'center'},
  deleteIcon: {fontSize: 15},
  itemTotal: {marginTop: 10, fontSize: 18, fontWeight: '800', color: colors.text},
  ctaRow: {backgroundColor: '#DEF2E7', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: '#CBEAD7', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 18},
  ctaLeft: {flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12},
  ctaIcon: {fontSize: 22, marginRight: 10},
  ctaTitle: {fontSize: 16, fontWeight: '800', color: colors.text},
  ctaSubtitle: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  addMoreBtn: {flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#B9E7CD'},
  addMoreIcon: {fontSize: 18, color: colors.primaryDark, fontWeight: '800', marginRight: 6},
  addMoreText: {fontSize: 14, fontWeight: '700', color: colors.primaryDark},
  infoRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 12},
  infoLeft: {flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12},
  infoIcon: {fontSize: 20, marginRight: 10},
  infoTitle: {fontSize: 15, fontWeight: '800', color: colors.text},
  infoSubtitle: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  addressBlock: {flex: 1},
  addressText: {fontSize: 12, color: colors.textMuted, marginTop: 2},
  infoAction: {fontSize: 15, fontWeight: '700', color: colors.primaryDark},
  summaryHeading: {fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 10, marginTop: 10},
  summaryCard: {backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border},
  summaryRowLine: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10},
  summaryLabel: {fontSize: 15, color: colors.text, fontWeight: '500'},
  summaryValue: {fontSize: 15, fontWeight: '700', color: colors.text},
  summaryValueDiscount: {fontSize: 15, fontWeight: '700', color: '#D45746'},
  summaryTotalRow: {marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border},
  summaryLabelBold: {fontSize: 17, fontWeight: '800', color: colors.text},
  totalValue: {fontSize: 20, fontWeight: '800', color: colors.text},
  trustBar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EAF7EF', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#CFEBDD', marginTop: 20, marginBottom: 10},
  trustItem: {flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center'},
  trustIcon: {fontSize: 12, color: colors.primary, marginRight: 5},
  trustText: {fontSize: 11, fontWeight: '700', color: colors.primaryDark},
  trustDivider: {width: 1, height: 20, backgroundColor: '#D1E9DB', marginHorizontal: 6},
  checkoutBar: {position: 'absolute', left: 14, right: 14, bottom: 10, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 14, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, ...shadow},
  checkoutLeft: {flex: 1, marginRight: 10},
  checkoutTotal: {fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.5},
  checkoutCount: {fontSize: 12, color: colors.textSoft, marginTop: 2},
  checkoutBtn: {backgroundColor: colors.primary, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, minWidth: 170, alignItems: 'center', justifyContent: 'center'},
  checkoutBtnText: {fontSize: 18, fontWeight: '800', color: '#fff'},
  loadingWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg},
  loadingText: {marginTop: space.sm},
  emptyWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl},
  emptyTitle: {fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 8},
  emptySubtitle: {fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: 20},
  primaryAction: {backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 14},
  primaryActionText: {fontSize: 16, color: '#fff', fontWeight: '800'},
});
