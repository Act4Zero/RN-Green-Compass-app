import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { knowledgeService, type CertificateVerification } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function CertificateVerificationScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { theme } = useAppTheme();
  const router = useRouter();
  const [certificate, setCertificate] = useState<CertificateVerification | null | undefined>();
  useEffect(() => { void knowledgeService.verifyCertificate(code).then(setCertificate); }, [code]);
  return <Screen><ScrollView><Content><PageHeader eyebrow="Public verification" title="Certificate of Completion" description="Green Compass learning records confirm completion only; they are not accredited professional qualifications." />{certificate === undefined ? <StatePanel icon="shield-checkmark-outline" title="Checking this certificate" message="Verifying the public record…" /> : certificate === null ? <StatePanel icon="alert-circle-outline" title="Certificate not found" message="The code is invalid, private, or the record is unavailable." action={<AppButton label="Visit Knowledge Hub" onPress={() => router.replace('/knowledge' as any)} />} /> : <Card elevated style={{ maxWidth: 720, width: '100%', alignSelf: 'center', padding: 32, borderTopWidth: 8, borderTopColor: certificate.status === 'valid' ? theme.colors.success : theme.colors.danger }}><Text style={[theme.typography.label, { color: certificate.status === 'valid' ? theme.colors.success : theme.colors.danger, textTransform: 'uppercase' }]}>{certificate.status}</Text><Text style={[theme.typography.h1, { color: theme.colors.text, marginTop: 12 }]}>{certificate.pathTitle}</Text><Text style={[theme.typography.h3, { color: theme.colors.textMuted, marginTop: 8 }]}>{certificate.holderName}</Text><View style={{ gap: 6, marginTop: 24 }}><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Issued {new Date(certificate.issuedAt).toLocaleDateString()}</Text><Text selectable style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Verification code: {certificate.code}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Record version {certificate.version}</Text></View></Card>}</Content></ScrollView></Screen>;
}
