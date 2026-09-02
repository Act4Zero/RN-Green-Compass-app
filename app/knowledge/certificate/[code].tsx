import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { knowledgeService, type CertificateVerification } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function CertificateVerificationScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { theme } = useAppTheme();
  const router = useRouter();
  const [certificate, setCertificate] = useState<CertificateVerification | null | undefined>();
  useEffect(() => { void knowledgeService.verifyCertificate(code).then(setCertificate); }, [code]);
  const download = async () => {
    if (!certificate) return;
    const html = certificateHtml(certificate);
    if (Platform.OS === 'web') return void Print.printAsync({ html });
    const file = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: 'Сертификат Green Compass' });
  };
  return <Screen><ScrollView><Content><PageHeader eyebrow="Публична проверка" title="Сертификат за завършване" description="Учебните записи в Green Compass потвърждават единствено завършването; те не са акредитирана професионална квалификация." />{certificate === undefined ? <StatePanel icon="shield-checkmark-outline" title="Проверяваме сертификата" message="Проверяваме публичния запис…" /> : certificate === null ? <StatePanel icon="alert-circle-outline" title="Сертификатът не е намерен" message="Кодът е невалиден, личен или записът не е достъпен." action={<AppButton label="Към знанията" onPress={() => router.replace('/knowledge' as any)} />} /> : <Card elevated style={{ maxWidth: 720, width: '100%', alignSelf: 'center', padding: 32, borderTopWidth: 8, borderTopColor: certificate.status === 'valid' ? theme.colors.success : theme.colors.danger }}><Text style={[theme.typography.label, { color: certificate.status === 'valid' ? theme.colors.success : theme.colors.danger, textTransform: 'uppercase' }]}>{certificate.status === 'valid' ? 'Валиден' : 'Невалиден'}</Text><Text style={[theme.typography.h1, { color: theme.colors.text, marginTop: 12 }]}>{certificate.pathTitle}</Text><Text style={[theme.typography.h3, { color: theme.colors.textMuted, marginTop: 8 }]}>{certificate.holderName}</Text><View style={{ gap: 6, marginTop: 24 }}><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Издаден на {new Date(certificate.issuedAt).toLocaleDateString('bg-BG')}</Text><Text selectable style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Код за проверка: {certificate.code}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Версия на записа: {certificate.version}</Text></View><AppButton label={Platform.OS === 'web' ? 'Принтирай или запази PDF' : 'Изтегли или сподели PDF'} icon="download-outline" onPress={() => void download()} style={{ marginTop: 24 }} /></Card>}</Content></ScrollView></Screen>;
}

function certificateHtml(certificate: CertificateVerification) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4 landscape;margin:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;background:#f3f6f0;color:#14251c}.sheet{width:297mm;height:210mm;box-sizing:border-box;padding:24mm;border:12mm solid #174c35;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.eyebrow{letter-spacing:3px;color:#376a51;font-weight:700}.title{font-size:44px;margin:18px 0 8px}.path{font-size:28px;color:#174c35}.name{font-size:34px;margin:26px 0}.meta{font-size:14px;color:#5b6b61;line-height:1.8}.note{margin-top:26px;font-size:12px;color:#5b6b61}</style></head><body><main class="sheet"><div class="eyebrow">GREEN COMPASS · ЗНАНИЯ</div><h1 class="title">Сертификат за завършване</h1><div class="path">${escapeHtml(certificate.pathTitle)}</div><div class="name">${escapeHtml(certificate.holderName)}</div><div class="meta">Издаден на ${new Date(certificate.issuedAt).toLocaleDateString('bg-BG')}<br>Код за проверка: ${escapeHtml(certificate.code)}<br>Версия на записа: ${certificate.version}</div><div class="note">Само запис за завършване. Сертификатът не е акредитирана професионална квалификация.</div></main></body></html>`;
}
function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]!)); }
