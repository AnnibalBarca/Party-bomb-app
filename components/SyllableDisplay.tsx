import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface SyllableDisplayProps {
  syllable: string;
}

export function SyllableDisplay({ syllable }: SyllableDisplayProps) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scaleAnim.setValue(0.7);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 6,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [syllable]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      <Text style={styles.label}>Trouvez un mot contenant</Text>
      <View style={styles.syllableBox}>
        <Text style={styles.syllable}>{syllable.toUpperCase()}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  syllableBox: {
    backgroundColor: '#16213e',
    borderWidth: 2,
    borderColor: '#e94560',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  syllable: {
    color: '#e94560',
    fontSize: 38,
    fontWeight: 'bold',
    letterSpacing: 6,
  },
});
