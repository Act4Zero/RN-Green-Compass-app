import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppButton, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAppTheme } from '@/theme';

export default function MoreScreen(){const router=useRouter();const{t}=useAppLocale();const{theme}=useAppTheme();const items=[
  {title:t('Knowledge Hub','Център за знания'),description:t('Learn through reviewed guides and missions.','Учете чрез проверени ръководства и мисии.'),icon:'library-outline' as const,route:'/knowledge'},
  {title:t('Community','Общност'),description:t('Join challenges, groups and local projects.','Включете се в предизвикателства, групи и местни проекти.'),icon:'people-outline' as const,route:'/community'},
  {title:t('Profile','Профил'),description:t('Manage interests, privacy, badges and preferences.','Управлявайте интереси, поверителност, значки и настройки.'),icon:'person-outline' as const,route:'/profile'},
];return <Screen><ScrollView><Content><PageHeader eyebrow={t('More','Още')} title={t('Keep exploring','Продължете да изследвате')} description={t('Learning, community and account tools live here.','Тук са обучението, общността и инструментите за профила.')}/><View style={{gap:12}}>{items.map(item=><Card key={item.route}><View style={{width:46,height:46,borderRadius:15,backgroundColor:theme.colors.primarySoft,alignItems:'center',justifyContent:'center',marginBottom:14}}><Ionicons name={item.icon} size={22} color={theme.colors.primary}/></View><Text style={[theme.typography.h2,{color:theme.colors.text}]}>{item.title}</Text><Text style={[theme.typography.body,{color:theme.colors.textMuted,marginTop:5,marginBottom:14}]}>{item.description}</Text><AppButton label={t('Open','Отвори')} icon="arrow-forward" variant="secondary" onPress={()=>router.push(item.route as any)}/></Card>)}</View></Content></ScrollView></Screen>}
