import React from 'react';
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View
} from '@react-pdf/renderer';
import { ARCHETYPE_DETAILS, FUNCTION_NAMES } from '../../data/archetypes';

const styles = StyleSheet.create({
  page: {
    padding: 42,
    backgroundColor: '#07111f',
    color: '#eef5f7',
    fontFamily: 'Helvetica'
  },
  brand: {
    marginBottom: 24,
    color: '#5ee4c4',
    fontSize: 11,
    letterSpacing: 2
  },
  eyebrow: {
    color: '#8da2ad',
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: 'uppercase'
  },
  type: {
    marginTop: 7,
    color: '#ffffff',
    fontSize: 44,
    fontWeight: 700
  },
  title: {
    marginBottom: 10,
    color: '#5ee4c4',
    fontSize: 18
  },
  description: {
    maxWidth: 440,
    color: '#c2d0d6',
    fontSize: 10,
    lineHeight: 1.6
  },
  section: {
    marginTop: 25,
    marginBottom: 9,
    color: '#ffffff',
    fontSize: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottom: '1 solid #1b3140'
  },
  key: {
    color: '#91a6af',
    fontSize: 9
  },
  value: {
    color: '#eef5f7',
    fontSize: 9,
    fontWeight: 700
  },
  note: {
    marginTop: 22,
    color: '#6f8791',
    fontSize: 8,
    lineHeight: 1.5
  },
  footer: {
    position: 'absolute',
    right: 42,
    bottom: 28,
    left: 42,
    color: '#536c76',
    fontSize: 7,
    textAlign: 'center'
  }
});

function PersonalityReportDocument({
  archetype,
  thetaScores = {},
  generatedAt
}) {
  const [name, description] = ARCHETYPE_DETAILS[archetype] || [
    'Your Cognitive Profile',
    'Explore your unique cognitive-function signature.'
  ];

  return (
    <Document title={`AXiM Personality Report — ${archetype || 'Profile'}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>AXiM / PERSONAL DEVELOPMENT</Text>
        <Text style={styles.eyebrow}>Your closest cognitive archetype</Text>
        <Text style={styles.type}>{archetype || 'PROFILE'}</Text>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.description}>{description}</Text>

        <Text style={styles.section}>
          Continuous cognitive function profile
        </Text>

        {Object.entries(thetaScores).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.key}>
              {key} · {FUNCTION_NAMES[key] || 'Cognitive function'}
            </Text>
            <Text style={styles.value}>
              {value > 0 ? '+' : ''}
              {value} theta
            </Text>
          </View>
        ))}

        <Text style={styles.section}>Your development direction</Text>
        <Text style={styles.description}>
          Build reliable access to your strongest functions while practicing
          lower-scoring functions in low-pressure settings. Treat this profile
          as a reflection tool rather than a clinical diagnosis or fixed
          identity.
        </Text>

        <Text style={styles.note}>
          This report uses an Expected A Posteriori graded-response estimate
          and cosine similarity against Jungian reference vectors. Results may
          shift as context, self-awareness, and behavior change.
        </Text>

        <Text style={styles.footer}>
          AXiM Personal Development · Generated {generatedAt || 'today'} ·
          Confidential
        </Text>
      </Page>
    </Document>
  );
}

export default PersonalityReportDocument;