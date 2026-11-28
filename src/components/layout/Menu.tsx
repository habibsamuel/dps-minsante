import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type PressableStateCallbackType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LANGUAGES, useLanguage, type Language, type LanguageCode } from '@/lib/language';
import { MENU_ITEMS, ROUTES, type IconName, type MenuItem } from '@/lib/navigation';
import { useTriage } from '@/store';
import { colors, shadow } from '@/theme';

/* ------------------------------------------------------------------ */
/*  Design                                                             */
/* ------------------------------------------------------------------ */

const GREEN = colors.primary;
const GREEN_DARK = colors.ink;
const TINT = colors.primarySoft;
const CREAM = colors.sand;
const WHITE = '#FFFFFF';
const CORNER = 24;
const DESKTOP_MIN = 1280;
const NATIVE = Platform.OS !== 'web';

const LOGO = require('../../../assets/images/logo.png');

type HoverState = PressableStateCallbackType & { hovered?: boolean };

/* ------------------------------------------------------------------ */
/*  Navigation partagée                                                */
/* ------------------------------------------------------------------ */

function useNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut } = useTriage();

  // 'profile' n'est plus dans MENU_ITEMS. 'home' est masqué côté desktop (le logo y ramène).
  const items = MENU_ITEMS.filter(
    (item) => !item.roles || (profile && item.roles.includes(profile.role)),
  );

  // Bouton principal : inscription si déconnecté.
  const cta: { label: string; icon: IconName; href: Href } = !profile
    ? { label: 'Créer mon compte', icon: 'person-add', href: ROUTES.register }
    : profile.role === 'medecin'
      ? { label: 'Espace médecin', icon: 'medkit', href: '/espace-medecin' }
      : { label: 'Nouvelle évaluation', icon: 'pulse', href: '/triage' };

  // Bouton rond : connexion si déconnecté, profil sinon.
  const account: { label: string; icon: IconName; href: Href } = profile
    ? { label: 'Mon profil', icon: 'person', href: '/profil' }
    : { label: 'Se connecter', icon: 'log-in-outline', href: ROUTES.login };

  const isActive = (href?: Href) => {
    if (typeof href !== 'string') return false;
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  };

  const go = (href: Href) => {
    if (isActive(href)) return;
    if (href === '/') router.replace('/');
    else router.push(href);
  };

  return { router, profile, signOut, items, cta, account, isActive, go };
}

type Nav = ReturnType<typeof useNav>;

/* ------------------------------------------------------------------ */
/*  Point d'entrée                                                     */
/* ------------------------------------------------------------------ */

type Props = {
  title?: string;
};

export function Menu({ title }: Props) {
  const { width } = useWindowDimensions();
  const nav = useNav();

  return width >= DESKTOP_MIN ? <DesktopMenu nav={nav} /> : <MobileMenu nav={nav} title={title} />;
}

/* ------------------------------------------------------------------ */
/*  Briques communes                                                   */
/* ------------------------------------------------------------------ */

function BarShell({
  children,
  flat = false,
  onLayout,
}: {
  children: ReactNode;
  flat?: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  const insets = useSafeAreaInsets();
  const radius = flat ? 0 : CORNER;

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.bar,
        { borderBottomLeftRadius: radius, borderBottomRightRadius: radius, paddingTop: insets.top },
      ]}
    >
      {children}
    </View>
  );
}

function Logo({ size }: { size: number }) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="Accueil — DPS Minsanté"
      onPress={() => router.replace('/')}
      style={(state) => [styles.logoWrap, (state as HoverState).hovered && styles.logoHover]}
    >
      <Image
        source={LOGO}
        style={{ width: size, height: size, mixBlendMode: 'multiply' }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </Pressable>
  );
}

function useRotation(on: boolean) {
  const [value] = useState(() => new Animated.Value(on ? 1 : 0));
  useEffect(() => {
    Animated.timing(value, {
      toValue: on ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE,
    }).start();
  }, [on, value]);
  return value.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
}

/** Fade doux du fond au survol : aucun bord, juste un tint léger. */
function useHoverTint(on: boolean) {
  const [value] = useState(() => new Animated.Value(on ? 1 : 0));
  useEffect(() => {
    Animated.timing(value, {
      toValue: on ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE,
    }).start();
  }, [on, value]);
  return value;
}

function CtaPill({
  label,
  icon,
  onPress,
  desktop = false,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
  desktop?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={(state) => {
        const { pressed, hovered } = state as HoverState;
        return [
          styles.cta,
          desktop ? styles.ctaDesktop : styles.ctaFull,
          desktop && hovered && styles.ctaLift,
          pressed && styles.ctaPressed,
        ];
      }}
    >
      <Ionicons name={icon} size={17} color={WHITE} />
      <Text style={styles.ctaText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function AccountButton({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={(state) => {
        const { pressed, hovered } = state as HoverState;
        return [styles.account, hovered && styles.accountHover, pressed && styles.accountPressed];
      }}
    >
      <Ionicons name={icon} size={20} color={GREEN} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Sélecteur de langue                                                */
/* ------------------------------------------------------------------ */

function LangTrigger({
  code,
  open,
  onPress,
  compact = false,
}: {
  code: LanguageCode;
  open: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  const rotate = useRotation(open);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Langue : ${code.toUpperCase()}`}
      accessibilityState={{ expanded: open }}
      onPress={onPress}
      hitSlop={6}
      style={(state) => {
        const { pressed, hovered } = state as HoverState;
        return [
          styles.lang,
          (hovered || open) && styles.langHover,
          pressed && styles.accountPressed,
        ];
      }}
    >
      <Ionicons name="globe-outline" size={18} color={GREEN} />
      <Text style={styles.langCode}>{code.toUpperCase()}</Text>
      {compact ? null : (
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={12} color={GREEN} />
        </Animated.View>
      )}
    </Pressable>
  );
}

function LangItem({
  lang,
  active,
  onPress,
}: {
  lang: Language;
  active: boolean;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[styles.langItem, (hovered || active) && styles.langItemOn]}
    >
      <View style={[styles.langBadge, active && styles.langBadgeOn]}>
        <Text style={[styles.langBadgeText, active && styles.langBadgeTextOn]}>
          {lang.code.toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.langName, active && styles.langNameOn]} numberOfLines={1}>
        {lang.nom}
      </Text>
      {active ? <Ionicons name="checkmark" size={16} color={GREEN} /> : null}
    </Pressable>
  );
}

function LangList({
  current,
  onSelect,
}: {
  current: LanguageCode;
  onSelect: (lang: Language) => void;
}) {
  return (
    <View>
      <Text style={styles.langHeading}>LANGUE</Text>
      {LANGUAGES.map((lang) => (
        <LangItem
          key={lang.code}
          lang={lang}
          active={lang.code === current}
          onPress={() => onSelect(lang)}
        />
      ))}
    </View>
  );
}

function DeskLang() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      accessible={false}
      onHoverIn={() => setOpen(true)}
      onHoverOut={() => setOpen(false)}
      style={styles.langWrap}
    >
      <LangTrigger code={language.code} open={open} onPress={() => setOpen((v) => !v)} />

      {open ? (
        <View style={styles.langDropWrap}>
          <View style={styles.langPanel}>
            <LangList
              current={language.code}
              onSelect={(lang) => {
                setLanguage(lang.code);
                setOpen(false);
              }}
            />
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  DESKTOP : logo | liens | actions (space-between)                   */
/* ------------------------------------------------------------------ */

function DesktopMenu({ nav }: { nav: Nav }) {
  const { items, cta, account, isActive, go } = nav;
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Pas de lien « Accueil » ici : le logo ramène à l'accueil.
  const links = items.filter((item) => item.key !== 'home');

  return (
    <BarShell>
      <View style={styles.deskRow}>
        {/* 1 : Logo à gauche */}
        <Logo size={100} />

        {/* 2 : Liens au centre */}
        <View style={styles.deskLinks}>
          {links.map((item) =>
            item.children?.length ? (
              <DeskGroup
                key={item.key}
                item={item}
                open={openKey === item.key}
                active={item.children.some((child) => isActive(child.href))}
                isActive={isActive}
                onOpen={() => setOpenKey(item.key)}
                onClose={() => setOpenKey(null)}
                onGo={(href) => {
                  setOpenKey(null);
                  go(href);
                }}
              />
            ) : (
              <DeskLink
                key={item.key}
                item={item}
                active={isActive(item.href)}
                onPress={() => item.href && go(item.href)}
              />
            ),
          )}
        </View>

        {/* 3 : Actions à droite */}
        <View style={styles.deskActions}>
          <DeskLang />
          <AccountButton
            icon={account.icon}
            label={account.label}
            onPress={() => go(account.href)}
          />
          <CtaPill desktop label={cta.label} icon={cta.icon} onPress={() => go(cta.href)} />
        </View>
      </View>
    </BarShell>
  );
}

function DeskLink({
  item,
  active,
  onPress,
}: {
  item: MenuItem;
  active: boolean;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const on = hovered || active;
  const tintOpacity = useHoverTint(on);
  const color = on ? GREEN_DARK : GREEN;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={styles.deskLinkWrap}
    >
      <Animated.View style={[styles.deskLinkTint, { opacity: tintOpacity }]} />
      <Ionicons name={item.icon} size={17} color={color} />
      <Text style={[styles.deskLabel, { color }]} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

function DeskGroup({
  item,
  open,
  active,
  isActive,
  onOpen,
  onClose,
  onGo,
}: {
  item: MenuItem;
  open: boolean;
  active: boolean;
  isActive: (href?: Href) => boolean;
  onOpen: () => void;
  onClose: () => void;
  onGo: (href: Href) => void;
}) {
  const on = open || active;
  const tintOpacity = useHoverTint(on);
  const rotate = useRotation(open);
  const color = on ? GREEN_DARK : GREEN;

  return (
    // Le survol du déclencheur ET du panneau garde le sous-menu ouvert.
    <Pressable accessible={false} onHoverIn={onOpen} onHoverOut={onClose} style={styles.group}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => (open ? onClose() : onOpen())}
        style={styles.deskLinkWrap}
      >
        <Animated.View style={[styles.deskLinkTint, { opacity: tintOpacity }]} />
        <Ionicons name={item.icon} size={17} color={color} />
        <Text style={[styles.deskLabel, { color }]} numberOfLines={1}>
          {item.label}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={11} color={color} />
        </Animated.View>
      </Pressable>

      {open ? (
        <View style={styles.dropWrap}>
          <View style={styles.dropPanel}>
            {item.children?.map((child) => (
              <DropItem
                key={child.key}
                label={child.label}
                icon={child.icon}
                active={isActive(child.href)}
                onPress={() => onGo(child.href)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

function DropItem({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: IconName;
  active: boolean;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[styles.dropItem, (hovered || active) && styles.dropItemHover]}
    >
      <View style={[styles.dropIcon, hovered && styles.dropIconHover]}>
        <Ionicons name={icon} size={14} color={GREEN} />
      </View>
      <Text style={[styles.dropLabel, { color: hovered ? GREEN_DARK : GREEN }]}>{label}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  MOBILE                                                             */
/* ------------------------------------------------------------------ */

function MobileMenu({ nav, title }: { nav: Nav; title?: string }) {
  const { router, profile, signOut, items, cta, account, isActive, go } = nav;
  const { language, setLanguage } = useLanguage();
  const { width, height } = useWindowDimensions();
  const padX = width >= 768 ? 32 : 20;

  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [barHeight, setBarHeight] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: NATIVE,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [open, progress]);

  const close = () => {
    setOpen(false);
    setExpanded(null);
  };

  const toggleMenu = () => {
    setLangOpen(false);
    if (open) close();
    else setOpen(true);
  };

  const toggleLang = () => {
    if (open) close();
    setLangOpen((value) => !value);
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const navigate = (href: Href) => {
    close();
    go(href);
  };

  const toggleGroup = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === key ? null : key));
  };

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] });

  return (
    <>
      <BarShell flat={open} onLayout={(e) => setBarHeight(e.nativeEvent.layout.height)}>
        <View style={[styles.mobRow, { paddingHorizontal: padX }]}>
          {title ? (
            <View style={styles.mobLeft}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour"
                onPress={goBack}
                style={styles.backBtn}
                hitSlop={8}
              >
                <Ionicons name="chevron-back" size={20} color={GREEN} />
              </Pressable>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            </View>
          ) : (
            <Logo size={72} />
          )}

          <View style={styles.mobActions}>
            <LangTrigger code={language.code} open={langOpen} onPress={toggleLang} compact />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              accessibilityState={{ expanded: open }}
              onPress={toggleMenu}
              style={styles.burger}
            >
              <Ionicons name={open ? 'close' : 'menu'} size={22} color={WHITE} />
            </Pressable>
          </View>
        </View>
      </BarShell>

      {langOpen ? (
        <View style={[styles.overlay, { top: barHeight }]}>
          <Pressable
            accessibilityLabel="Fermer la liste des langues"
            style={[StyleSheet.absoluteFill, styles.backdrop]}
            onPress={() => setLangOpen(false)}
          />
          <View style={[styles.langSheet, { marginRight: padX }]}>
            <View style={styles.langPanel}>
              <LangList
                current={language.code}
                onSelect={(lang) => {
                  setLanguage(lang.code);
                  setLangOpen(false);
                }}
              />
            </View>
          </View>
        </View>
      ) : null}

      {mounted ? (
        <View style={[styles.overlay, { top: barHeight }]}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}>
            <Pressable
              accessibilityLabel="Fermer le menu"
              style={StyleSheet.absoluteFill}
              onPress={close}
            />
          </Animated.View>

          <Animated.View
            style={[styles.panelShadow, { opacity: progress, transform: [{ translateY }] }]}
          >
            <View style={styles.panel}>
              <ScrollView
                style={{ maxHeight: height * 0.8 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View style={styles.list}>
                  {items.map((item) => (
                    <MobRow
                      key={item.key}
                      item={item}
                      expanded={expanded === item.key}
                      isActive={isActive}
                      onToggle={() => toggleGroup(item.key)}
                      onGo={navigate}
                    />
                  ))}
                </View>

                <View style={styles.ctaZone}>
                  <View style={styles.ctaRow}>
                    <AccountButton
                      icon={account.icon}
                      label={account.label}
                      onPress={() => navigate(account.href)}
                    />
                    <View style={styles.ctaGrow}>
                      <CtaPill
                        label={cta.label}
                        icon={cta.icon}
                        onPress={() => navigate(cta.href)}
                      />
                    </View>
                  </View>
                  {profile ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        close();
                        signOut();
                        router.replace('/');
                      }}
                      style={styles.signOut}
                      hitSlop={8}
                    >
                      <Text style={styles.signOutText}>Se déconnecter</Text>
                    </Pressable>
                  ) : null}
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      ) : null}
    </>
  );
}

function MobRow({
  item,
  expanded,
  isActive,
  onToggle,
  onGo,
}: {
  item: MenuItem;
  expanded: boolean;
  isActive: (href?: Href) => boolean;
  onToggle: () => void;
  onGo: (href: Href) => void;
}) {
  const hasChildren = Boolean(item.children?.length);
  const active = hasChildren
    ? Boolean(item.children?.some((child) => isActive(child.href)))
    : isActive(item.href);
  const rotate = useRotation(expanded);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={hasChildren ? { expanded } : { selected: active }}
        onPress={() => (hasChildren ? onToggle() : item.href && onGo(item.href))}
        style={({ pressed }) => [styles.row, (pressed || active) && styles.rowTint]}
      >
        <Ionicons name={item.icon} size={17} color={GREEN} style={styles.rowIcon} />
        <Text style={styles.rowLabel}>{item.label}</Text>
        {hasChildren ? (
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="chevron-down" size={12} color={GREEN} />
          </Animated.View>
        ) : null}
      </Pressable>

      {hasChildren && expanded
        ? item.children?.map((child) => (
            <Pressable
              key={child.key}
              accessibilityRole="button"
              onPress={() => onGo(child.href)}
              style={({ pressed }) => [
                styles.subRow,
                (pressed || isActive(child.href)) && styles.rowTint,
              ]}
            >
              <Ionicons name={child.icon} size={15} color={GREEN} style={styles.subIcon} />
              <Text style={styles.subLabel}>{child.label}</Text>
            </Pressable>
          ))
        : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  bar: {
    backgroundColor: CREAM,
    zIndex: 30,
    ...shadow.card,
  },

  logoWrap: { alignItems: 'center', justifyContent: 'center' },
  logoHover: { opacity: 0.8 },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: GREEN,
    ...shadow.soft,
  },
  ctaDesktop: { paddingHorizontal: 24, paddingVertical: 12, flexShrink: 0 },
  ctaFull: { paddingHorizontal: 20, paddingVertical: 12, alignSelf: 'stretch' },
  ctaLift: { transform: [{ translateY: -2 }], ...shadow.card },
  ctaPressed: { transform: [{ scale: 0.96 }] },
  ctaText: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 15,
    color: WHITE,
  },

  account: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountHover: { backgroundColor: TINT },
  accountPressed: { transform: [{ scale: 0.94 }] },

  lang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: GREEN,
  },
  langHover: { backgroundColor: TINT },
  langCode: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 14,
    color: GREEN,
    letterSpacing: 0.5,
  },
  langWrap: { position: 'relative', zIndex: 45 },
  langDropWrap: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: 248,
    paddingTop: 10,
    zIndex: 60,
  },
  langSheet: { alignSelf: 'flex-end', marginTop: 8, width: 248 },
  langPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    ...shadow.card,
  },
  langHeading: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.muted,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  langItemOn: { backgroundColor: TINT },
  langBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TINT,
    borderWidth: 1,
    borderColor: colors.line,
  },
  langBadgeOn: { backgroundColor: GREEN, borderColor: GREEN },
  langBadgeText: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 12,
    color: GREEN,
  },
  langBadgeTextOn: { color: WHITE },
  langName: {
    fontFamily: 'Comfortaa_500Medium',
    fontSize: 15,
    color: GREEN,
    flex: 1,
  },
  langNameOn: { fontFamily: 'Comfortaa_700Bold' },

  /* ---- Desktop ---- */
  deskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 124,
    paddingHorizontal: 32,
  },
  deskLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 108,
  },
  deskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  group: { position: 'relative', zIndex: 40 },

  /* ---- Lien de nav : tint doux sans bordure ---- */
  deskLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: 'relative',
  },
  deskLinkTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    backgroundColor: TINT,
    pointerEvents: 'none',
  },
  deskLabel: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 16,
  },

  /* ---- Sous-menu ---- */
  dropWrap: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginLeft: -144,
    width: 288,
    paddingTop: 10,
    zIndex: 50,
  },
  dropPanel: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropItemHover: { backgroundColor: TINT },
  dropIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TINT,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dropIconHover: { transform: [{ scale: 1.1 }] },
  dropLabel: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 15,
    flex: 1,
  },

  /* ---- Mobile ---- */
  mobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 96,
  },
  mobLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  mobActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Comfortaa_700Bold',
    fontSize: 18,
    color: GREEN,
    flex: 1,
  },
  burger: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },

  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10, elevation: 10 },
  backdrop: { backgroundColor: 'rgba(15, 30, 30, 0.28)' },
  panelShadow: {
    backgroundColor: CREAM,
    borderBottomLeftRadius: CORNER,
    borderBottomRightRadius: CORNER,
    ...shadow.card,
  },
  panel: {
    backgroundColor: CREAM,
    borderBottomLeftRadius: CORNER,
    borderBottomRightRadius: CORNER,
    overflow: 'hidden',
  },
  list: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, gap: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  rowTint: { backgroundColor: TINT },
  rowIcon: { width: 20, textAlign: 'center' },
  rowLabel: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 15,
    color: GREEN,
    flex: 1,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 48,
    paddingRight: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  subIcon: { width: 16, textAlign: 'center' },
  subLabel: {
    fontFamily: 'Comfortaa_500Medium',
    fontSize: 15,
    color: GREEN,
  },
  ctaZone: { paddingHorizontal: 24, paddingBottom: 24, gap: 8 },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ctaGrow: { flex: 1 },
  signOut: { alignItems: 'center', paddingVertical: 6 },
  signOutText: {
    fontFamily: 'Comfortaa_600SemiBold',
    fontSize: 14,
    color: colors.muted,
  },
});