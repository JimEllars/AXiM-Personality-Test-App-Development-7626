import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { ARCHETYPE_DETAILS, FUNCTION_NAMES } from '../../data/archetypes';

const styles = StyleSheet.create({
  page: { padding: 42, backgroundColor: '#07111f', color: '#eef5f7', fontFamily: 'Helvetica' },
  brand: { fontSize: 11, letterSpacing: 2, color: '#5ee4c4', marginBottom: 24 },
  eyebrow: { fontSize: 8, letterSpacing: 1.4, color: '#8da2ad', textTransform: 'uppercase' },
  type: { fontSize: 44, fontWeight: 700, color: '#ffffff', marginTop: 7 },
  title: { fontSize: 18, color: '#5ee4c4', marginBottom: 10 },
  description: { fontSize: 10, lineHeight: 1.6, color: '#c2d0d6', maxWidth: 440 },
  section: { fontSize: 12, color: '#ffffff', marginTop: 25, marginBottom: 9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottom: '1 solid #1b3140' },
  key: { fontSize: 9, color: '#91a6af' },
  value: { fontSize: 9, color: '#eef5f7', fontWeight: 700 },
  note: { fontSize: 8, lineHeight: 1.5, color: '#6f8791', marginTop: 22 },
  footer: { position: 'absolute', bottom: 28, left: 42, right: 42, fontSize: 7, color: '#536c76', textAlign: 'center' }
});

function PersonalityReportDocument({ archetype, thetaScores, generatedAt }) {
  const [name, description] = ARCHETYPE_DETAILS[archetype];

  return (
    <Document title={`AXiM Personality Report — ${archetype}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>AXiM / PERSONAL DEVELOPMENT</Text>
        <Text style={styles.eyebrow}>Your closest cognitive archetype</Text>
        <Text style={styles.type}>{archetype}</Text>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.description}>{description}</Text>

        <Text style={styles.section}>Continuous cognitive function profile</Text>
        {Object.entries(thetaScores).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.key}>{key} · {FUNCTION_NAMES[key]}</Text>
            <Text style={styles.value}>{value > 0 ? '+' : ''}{value} theta</Text>
          </View>
        ))}

        <Text style={styles.section}>Your development direction</Text>
        <Text style={styles.description}>
          Build reliable access to your strongest functions while practicing the
          lower-scoring functions in low-pressure settings. Treat this profile as
          a reflection tool rather than a clinical diagnosis or fixed identity.
        </Text>
        <Text style={styles.note}>
          This report uses an Expected A Posteriori graded-response estimate and
          cosine similarity against Jungian reference vectors. Results may shift
          as context, self-awareness, and behavior change.
        </Text>
        <Text style={styles.footer}>
          AXiM Personal Development · Generated {generatedAt} · Confidential
        </Text>
      </Page>
    </Document>
  );
}

export default PersonalityReportDocument;