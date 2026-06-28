import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Path } from '@react-pdf/renderer';

// Base Styles mapping
const baseStyles = StyleSheet.create({
  page: { flexDirection: 'row', backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  pageMinimalista: { flexDirection: 'column', backgroundColor: '#FFFFFF', fontFamily: 'Helvetica', padding: 40, width: '100%', height: '100%' },
  pageEjecutivo: { flexDirection: 'column', backgroundColor: '#FFFFFF', fontFamily: 'Times-Roman', padding: 35, width: '100%', height: '100%' },
  
  // Moderno (2 Columns)
  leftColumn: { width: '35%', padding: 25, color: '#FFFFFF' },
  rightColumn: { width: '65%', padding: 30 },

  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 20, alignSelf: 'center', objectFit: 'cover' },
  profileImageMin: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 15, objectFit: 'cover' },
  profileImageEjecutivo: { width: 90, height: 90, objectFit: 'cover', marginRight: 20 },

  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, flexWrap: 'nowrap' },
  nameEjecutivo: { fontSize: 26, fontWeight: 'bold', fontFamily: 'Times-Bold', marginBottom: 4, flexWrap: 'nowrap' },
  
  title: { fontSize: 14, marginBottom: 15, flexWrap: 'nowrap' },
  titleEjecutivo: { fontSize: 14, fontFamily: 'Times-Italic', marginBottom: 15, color: '#4B5563', flexWrap: 'nowrap' },
  
  sectionTitleLeft: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.4)', paddingBottom: 5 },
  sectionTitleRight: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 5 },
  sectionTitleEjecutivo: { fontSize: 14, fontWeight: 'bold', fontFamily: 'Times-Bold', marginBottom: 8, marginTop: 15, borderBottomWidth: 2, paddingBottom: 2, textTransform: 'uppercase' },

  textLeft: { fontSize: 11, marginBottom: 6, color: 'rgba(255, 255, 255, 0.9)' },
  textRight: { fontSize: 11, color: '#4B5563', lineHeight: 1.5 },
  textEjecutivo: { fontSize: 11, color: '#374151', lineHeight: 1.5, fontFamily: 'Times-Roman' },

  itemTitle: { fontSize: 12, fontWeight: 'bold', color: '#1F2937' },
  itemTitleEjecutivo: { fontSize: 12, fontWeight: 'bold', fontFamily: 'Times-Bold', color: '#111827' },
  
  itemSubtitle: { fontSize: 10, color: '#6B7280', marginBottom: 5 },
  itemSubtitleEjecutivo: { fontSize: 10, fontFamily: 'Times-Italic', color: '#4B5563', marginBottom: 5 },

  pill: { backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 4, marginBottom: 6 },
  pillMin: { border: '1pt solid #D1D5DB', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, marginRight: 6, marginBottom: 6 },

  experienceBlock: { marginBottom: 15 },
  bulletPointContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5, flexWrap: 'nowrap' },
  bulletPointBullet: { width: 15, fontSize: 10, color: '#4B5563' },
  bulletPointText: { flex: 1, minWidth: 0, fontSize: 10, color: '#4B5563', lineHeight: 1.4 },
  
  headerEjecutivo: { flexDirection: 'row', borderBottomWidth: 2, paddingBottom: 15, marginBottom: 15 }
});

interface CVData {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    correo: string;
    telefono?: string;
    municipio?: string;
    estado?: string;
    carrera: string;
    habilidades: string[];
    idiomas: string[];
    bio?: string;
    foto_perfil_url?: string;
    experiencias: any[];
    proyectos: any[];
    educacion_extra: any[];
}

export const PlantillaCV = ({ data, accentColor = '#0F766E', showPhoto = true, templateInfo, styling }: { 
  data: CVData, 
  accentColor?: string, 
  showPhoto?: boolean, 
  templateInfo?: { base: string, variante: string, sections?: any[] },
  styling?: { fontSize?: string, lineSpacing?: string, fontFamily?: string, singlePage?: boolean, showCarrera?: boolean }
}) => {
  // Local compiled styles that merge base static styles with user custom styles
  const getFontFamily = (baseFont: string) => {
      const family = styling?.fontFamily;
      if (!family) return baseFont;
      const isSerif = family === 'Times-Roman';
      const isMono = family === 'Courier';
      const isSans = family === 'Helvetica';

      if (isSerif) {
          if (baseFont.toLowerCase().includes('bold')) return 'Times-Bold';
          if (baseFont.toLowerCase().includes('italic') || baseFont.toLowerCase().includes('oblique')) return 'Times-Italic';
          return 'Times-Roman';
      }
      if (isMono) {
          if (baseFont.toLowerCase().includes('bold')) return 'Courier-Bold';
          if (baseFont.toLowerCase().includes('italic') || baseFont.toLowerCase().includes('oblique')) return 'Courier-Oblique';
          return 'Courier';
      }
      if (isSans) {
          if (baseFont.toLowerCase().includes('bold')) return 'Helvetica-Bold';
          if (baseFont.toLowerCase().includes('italic') || baseFont.toLowerCase().includes('oblique')) return 'Helvetica-Oblique';
          return 'Helvetica';
      }
      return family;
  };

  const fOption = styling?.fontSize || 'md';
  const isSinglePage = styling?.singlePage ?? false;

  // Calcular densidad de contenido para ajustar dinámicamente el tamaño si singlePage es true
  const totalExperiencias = data.experiencias?.length || 0;
  const totalProyectos = data.proyectos?.length || 0;
  const totalEducacion = data.educacion_extra?.length || 0;
  const totalHabilidades = data.habilidades?.length || 0;
  const totalIdiomas = data.idiomas?.length || 0;
  const lengthBio = data.bio?.length || 0;
  
  let totalLogros = 0;
  data.experiencias?.forEach(exp => {
      totalLogros += (exp.logros?.length || 0);
  });
  data.proyectos?.forEach(proj => {
      totalLogros += (proj.puntos_clave?.length || 0);
  });

  // Puntuación de densidad estimada
  const densidad = (totalExperiencias * 4) + (totalProyectos * 4) + (totalEducacion * 2.5) + (totalLogros * 1.5) + (totalHabilidades * 0.25) + (totalIdiomas * 0.25) + (lengthBio / 80);
  
  let factorEscala = 1.0;
  if (isSinglePage) {
      if (densidad > 40) {
          factorEscala = 0.82; // Súper alta densidad, escala mínima muy legible
      } else if (densidad > 30) {
          factorEscala = 0.85; // Muy alta densidad
      } else if (densidad > 20) {
          factorEscala = 0.88; // Alta densidad
      } else if (densidad > 12) {
          factorEscala = 0.92; // Densidad media
      } else {
          factorEscala = 0.96; // Baja densidad
      }
  }

  const sizes = {
      text: isSinglePage ? Math.max(8.5, 10.5 * factorEscala) : (fOption === 'sm' ? 9.5 : fOption === 'lg' ? 12.5 : 11),
      subText: isSinglePage ? Math.max(8.0, 9.5 * factorEscala) : (fOption === 'sm' ? 8.5 : fOption === 'lg' ? 11.5 : 10),
      itemTitle: isSinglePage ? Math.max(9.0, 11.5 * factorEscala) : (fOption === 'sm' ? 10.5 : fOption === 'lg' ? 13.5 : 12),
      sectionTitleLeft: isSinglePage ? Math.max(10.0, 13 * factorEscala) : (fOption === 'sm' ? 12.5 : fOption === 'lg' ? 15.5 : 14),
      sectionTitleRight: isSinglePage ? Math.max(11.0, 15 * factorEscala) : (fOption === 'sm' ? 14 : fOption === 'lg' ? 18 : 16),
      name: isSinglePage ? Math.max(16.0, 24 * factorEscala) : (fOption === 'sm' ? 20 : fOption === 'lg' ? 28 : 24),
      nameEjecutivo: isSinglePage ? Math.max(18.0, 26 * factorEscala) : (fOption === 'sm' ? 22 : fOption === 'lg' ? 30 : 26),
  };

  const lOption = styling?.lineSpacing || 'normal';
  const lSpacing = isSinglePage ? Math.max(1.05, 1.25 * factorEscala) : (lOption === 'compact' ? 1.2 : lOption === 'spacious' ? 1.7 : 1.45);

  const marginBlock = isSinglePage ? Math.max(2, Math.round(15 * factorEscala)) : 15;
  const marginBullet = isSinglePage ? Math.max(1, Math.round(5 * factorEscala)) : 5;
  const paddingPageMin = isSinglePage ? Math.max(12, Math.round(40 * factorEscala)) : 40;
  const paddingPageEj = isSinglePage ? Math.max(12, Math.round(35 * factorEscala)) : 35;
  const paddingColLeft = isSinglePage ? Math.max(10, Math.round(25 * factorEscala)) : 25;
  const paddingColRight = isSinglePage ? Math.max(12, Math.round(30 * factorEscala)) : 30;
  const profileImageSize = isSinglePage ? Math.max(45, Math.round(100 * factorEscala)) : 100;
  const profileImageMinSize = isSinglePage ? Math.max(40, Math.round(80 * factorEscala)) : 80;
  const profileImageEjSize = isSinglePage ? Math.max(45, Math.round(90 * factorEscala)) : 90;

  const styles = {
      page: { ...baseStyles.page, fontFamily: getFontFamily('Helvetica') },
      pageMinimalista: { 
          ...baseStyles.pageMinimalista, 
          fontFamily: getFontFamily('Helvetica'),
          padding: paddingPageMin
      },
      pageEjecutivo: { 
          ...baseStyles.pageEjecutivo, 
          fontFamily: getFontFamily('Times-Roman'),
          padding: paddingPageEj
      },
      
      leftColumn: {
          ...baseStyles.leftColumn,
          padding: paddingColLeft
      },
      rightColumn: {
          ...baseStyles.rightColumn,
          padding: paddingColRight
      },
      profileImage: {
          ...baseStyles.profileImage,
          width: profileImageSize,
          height: profileImageSize,
          borderRadius: profileImageSize / 2,
          marginBottom: isSinglePage ? Math.max(5, Math.round(20 * factorEscala)) : 20
      },
      profileImageMin: {
          ...baseStyles.profileImageMin,
          width: profileImageMinSize,
          height: profileImageMinSize,
          borderRadius: profileImageMinSize / 2,
          marginBottom: isSinglePage ? Math.max(5, Math.round(15 * factorEscala)) : 15
      },
      profileImageEjecutivo: {
          ...baseStyles.profileImageEjecutivo,
          width: profileImageEjSize,
          height: profileImageEjSize,
          marginRight: isSinglePage ? Math.max(6, Math.round(20 * factorEscala)) : 20
      },
      
      name: { ...baseStyles.name, fontSize: sizes.name, fontFamily: getFontFamily('Helvetica-Bold') },
      nameEjecutivo: { ...baseStyles.nameEjecutivo, fontSize: sizes.nameEjecutivo, fontFamily: getFontFamily('Times-Bold') },
      
      title: { ...baseStyles.title, fontSize: sizes.itemTitle, fontFamily: getFontFamily('Helvetica') },
      titleEjecutivo: { ...baseStyles.titleEjecutivo, fontSize: sizes.itemTitle, fontFamily: getFontFamily('Times-Italic') },
      
      sectionTitleLeft: { 
          ...baseStyles.sectionTitleLeft, 
          fontSize: sizes.sectionTitleLeft, 
          fontFamily: getFontFamily('Helvetica-Bold'),
          marginTop: isSinglePage ? Math.max(5, Math.round(20 * factorEscala)) : 20,
          marginBottom: isSinglePage ? Math.max(2, Math.round(10 * factorEscala)) : 10
      },
      sectionTitleRight: { 
          ...baseStyles.sectionTitleRight, 
          fontSize: sizes.sectionTitleRight, 
          fontFamily: getFontFamily('Helvetica-Bold'),
          marginTop: isSinglePage ? Math.max(5, Math.round(15 * factorEscala)) : 15,
          marginBottom: isSinglePage ? Math.max(2, Math.round(10 * factorEscala)) : 10
      },
      sectionTitleEjecutivo: { 
          ...baseStyles.sectionTitleEjecutivo, 
          fontSize: sizes.sectionTitleLeft, 
          fontFamily: getFontFamily('Times-Bold'),
          marginTop: isSinglePage ? Math.max(4, Math.round(15 * factorEscala)) : 15,
          marginBottom: isSinglePage ? Math.max(2, Math.round(8 * factorEscala)) : 8
      },
      
      textLeft: { ...baseStyles.textLeft, fontSize: sizes.text, lineHeight: lSpacing, fontFamily: getFontFamily('Helvetica') },
      textRight: { ...baseStyles.textRight, fontSize: sizes.text, lineHeight: lSpacing, fontFamily: getFontFamily('Helvetica') },
      textEjecutivo: { ...baseStyles.textEjecutivo, fontSize: sizes.text, lineHeight: lSpacing, fontFamily: getFontFamily('Times-Roman') },
      
      itemTitle: { ...baseStyles.itemTitle, fontSize: sizes.itemTitle, fontFamily: getFontFamily('Helvetica-Bold') },
      itemTitleEjecutivo: { ...baseStyles.itemTitleEjecutivo, fontSize: sizes.itemTitle, fontFamily: getFontFamily('Times-Bold') },
      
      itemSubtitle: { ...baseStyles.itemSubtitle, fontSize: sizes.subText, fontFamily: getFontFamily('Helvetica'), marginBottom: isSinglePage ? Math.max(1, Math.round(5 * factorEscala)) : 5 },
      itemSubtitleEjecutivo: { ...baseStyles.itemSubtitleEjecutivo, fontSize: sizes.subText, fontFamily: getFontFamily('Times-Italic'), marginBottom: isSinglePage ? Math.max(1, Math.round(5 * factorEscala)) : 5 },
      
      pill: baseStyles.pill,
      pillMin: {
          ...baseStyles.pillMin,
          marginRight: isSinglePage ? Math.max(2, Math.round(6 * factorEscala)) : 6,
          marginBottom: isSinglePage ? Math.max(2, Math.round(6 * factorEscala)) : 6,
          paddingVertical: isSinglePage ? Math.max(1, Math.round(4 * factorEscala)) : 4,
          paddingHorizontal: isSinglePage ? Math.max(3, Math.round(8 * factorEscala)) : 8
      },
      experienceBlock: { 
          ...baseStyles.experienceBlock,
          marginBottom: marginBlock
      },
      bulletPointContainer: { 
          ...baseStyles.bulletPointContainer,
          marginBottom: marginBullet
      },
      bulletPointBullet: { ...baseStyles.bulletPointBullet, fontSize: sizes.subText, fontFamily: getFontFamily('Helvetica') },
      bulletPointText: { ...baseStyles.bulletPointText, fontSize: sizes.subText, lineHeight: lSpacing, fontFamily: getFontFamily('Helvetica') },
      headerEjecutivo: {
          ...baseStyles.headerEjecutivo,
          paddingBottom: isSinglePage ? Math.max(4, Math.round(15 * factorEscala)) : 15,
          marginBottom: isSinglePage ? Math.max(5, Math.round(15 * factorEscala)) : 15
      }
  };

  const { nombre, apellidoPaterno, apellidoMaterno, correo, municipio, estado, carrera, habilidades, idiomas, bio, foto_perfil_url, experiencias, proyectos, educacion_extra } = data;
  const baseLayout = templateInfo?.base || 'moderno';
  const variante = templateInfo?.variante || 'classic';
  
  const sectionsConfig = templateInfo?.sections || [
      { id: 'bio', visible: true },
      { id: 'habilidades', visible: true },
      { id: 'idiomas', visible: true },
      { id: 'experiencias', visible: true },
      { id: 'proyectos', visible: true },
      { id: 'educacion_extra', visible: true }
  ];

  const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  }

  const isVisible = (id: string) => {
      const s = sectionsConfig.find(x => x.id === id);
      return s ? s.visible : true;
  }

  // Renderizador de Secciones Modulares (Respeta Toggles)
  const renderItemRight = (id: string, isCompact: boolean = false, isCentered: boolean = false) => {
      if (!isVisible(id)) return null;

      switch(id) {
          case 'bio':
              if(!bio) return null;
              return (
                  <View key="bio" style={{ marginBottom: isCompact ? 10 : 15 }}>
                    <Text style={[styles.sectionTitleRight, { color: accentColor, textAlign: isCentered ? 'center' : 'left' }]}>Perfil Profesional</Text>
                    <Text style={[styles.textRight, { textAlign: isCentered ? 'center' : 'justify' }]}>{bio}</Text>
                  </View>
              );
          case 'experiencias':
              if(!experiencias || experiencias.length === 0) return null;
              return (
                  <View key="experiencias">
                    <Text style={[styles.sectionTitleRight, { color: accentColor, textAlign: isCentered ? 'center' : 'left' }]}>Experiencia Profesional</Text>
                    {experiencias.map((exp: any, i: number) => (
                      <View key={i} style={[styles.experienceBlock, isCompact ? { marginBottom: 10 } : {}]} wrap={false}>
                        <Text style={styles.itemTitle}>{exp.puesto} - {exp.empresa}</Text>
                        <Text style={styles.itemSubtitle}>
                          {formatDate(exp.fechaInicio)} - {exp.fechaFin ? formatDate(exp.fechaFin) : 'Actualidad'}
                        </Text>
                        {(exp.logros || []).map((logro: string, idx: number) => (
                          <View key={idx} style={styles.bulletPointContainer}>
                              <Text style={styles.bulletPointBullet}>•</Text>
                              <Text style={styles.bulletPointText}>{logro}</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
              );
          case 'proyectos':
              if(!proyectos || proyectos.length === 0) return null;
              return (
                  <View key="proyectos">
                    <Text style={[styles.sectionTitleRight, { color: accentColor, textAlign: isCentered ? 'center' : 'left' }]}>Proyectos Destacados</Text>
                    {proyectos.map((proj: any, i: number) => (
                      <View key={i} style={[styles.experienceBlock, isCompact ? { marginBottom: 10 } : {}]} wrap={false}>
                        <Text style={styles.itemTitle}>{proj.nombre}</Text>
                        <Text style={styles.itemSubtitle}>
                          {formatDate(proj.fechaInicio)} - {proj.fechaFin ? formatDate(proj.fechaFin) : 'Actualidad'}
                        </Text>
                        {(proj.puntos_clave || []).map((punto: string, idx: number) => (
                           <View key={idx} style={styles.bulletPointContainer}>
                              <Text style={styles.bulletPointBullet}>•</Text>
                              <Text style={styles.bulletPointText}>{punto}</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
              );
          case 'educacion_extra':
              if(!educacion_extra || educacion_extra.length === 0) return null;
              return (
                  <View key="educacion">
                    <Text style={[styles.sectionTitleRight, { color: accentColor, textAlign: isCentered ? 'center' : 'left' }]}>Formación Adicional</Text>
                    {educacion_extra.map((edu: any, i: number) => (
                      <View key={i} style={[styles.experienceBlock, isCompact ? { marginBottom: 5 } : {}]} wrap={false}>
                        <Text style={styles.itemTitle}>{edu.titulo}</Text>
                        <Text style={styles.itemSubtitle}>{edu.institucion} {edu.año ? `(${edu.año})` : ''}</Text>
                      </View>
                    ))}
                  </View>
              );
          default:
              return null;
      }
  };

  // --- RENDER MODERNO (2 Columnas) ---
  if (baseLayout === 'moderno') {
      const isInverted = variante === 'inverted';
      const isCompact = variante === 'compact' || isSinglePage;
      const isCreative = variante === 'creative';

      return (
        <Document>
          <Page size="A4" style={[styles.page, { flexDirection: isInverted ? 'row-reverse' : 'row' }]} wrap={true}>
            <View style={[styles.leftColumn, { backgroundColor: accentColor, width: isCreative ? '40%' : '35%' }]}>
              {showPhoto && foto_perfil_url && (
                <Image src={foto_perfil_url} style={[styles.profileImage, isCreative ? { borderRadius: 10 } : {}]} />
              )}
              <Text style={[styles.sectionTitleLeft, isCreative ? { borderBottomWidth: 0, fontSize: 16 } : {}]}>Contacto</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, width: '100%' }}>
                <View style={{ width: 14, marginRight: 6, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' }}></Text>
                </View>
                <Text style={{ flex: 1, fontSize: 10, color: '#FFFFFF' }}>{correo}</Text>
              </View>
              {municipio && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, width: '100%' }}>
                  <View style={{ width: 14, marginRight: 6, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' }}></Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 10, color: '#FFFFFF' }}>{municipio}, {estado}</Text>
                </View>
              )}
              
              {sectionsConfig.filter(s => ['habilidades', 'idiomas'].includes(s.id)).map(s => {
                  if (!s.visible) return null;
                  if (s.id === 'habilidades' && habilidades && habilidades.length > 0) {
                      return (
                          <View key="hab">
                              <Text style={[styles.sectionTitleLeft, isCreative ? { borderBottomWidth: 0, fontSize: 16 } : {}]}>Habilidades</Text>
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                  {habilidades.map((hab, i) => (
                                    <View key={i} style={[styles.pill, { marginRight: 4, marginBottom: 4 }, isCompact ? { paddingVertical: 2, paddingHorizontal: 5, marginBottom: 3, marginRight: 3 } : {}]}>
                                       <Text style={{ fontSize: isSinglePage ? 8 : 9, color: '#FFFFFF' }}>{hab}</Text>
                                    </View>
                                  ))}
                              </View>
                          </View>
                      );
                  }
                  if (s.id === 'idiomas' && idiomas && idiomas.length > 0) {
                      return (
                          <View key="idio">
                              <Text style={[styles.sectionTitleLeft, isCreative ? { borderBottomWidth: 0, fontSize: 16 } : {}]}>Idiomas</Text>
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                  {idiomas.map((idioma, i) => (
                                    <View key={i} style={[styles.pill, { marginRight: 4, marginBottom: 4 }, isCompact ? { paddingVertical: 2, paddingHorizontal: 5, marginBottom: 3, marginRight: 3 } : {}]}>
                                       <Text style={{ fontSize: isSinglePage ? 8 : 9, color: '#FFFFFF' }}>{idioma}</Text>
                                    </View>
                                  ))}
                              </View>
                          </View>
                      );
                  }
                  return null;
              })}
            </View>

            <View style={[styles.rightColumn, { width: isCreative ? '60%' : '65%' }]}>
              <View style={{ width: '100%', marginBottom: 15 }}>
                  <Text style={[styles.name, { color: '#111827' }]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
                  {styling?.showCarrera !== false && (
                      <Text style={[styles.title, { color: accentColor }]}>{carrera}</Text>
                  )}
              </View>

              {sectionsConfig.filter(s => ['bio', 'experiencias', 'proyectos', 'educacion_extra'].includes(s.id)).map(s => renderItemRight(s.id, isCompact, false))}
            </View>
          </Page>
        </Document>
      );
  }

  // --- RENDER MINIMALISTA (1 Columna, Centrado/Izquierda) ---
  if (baseLayout === 'minimalista') {
      const isCentered = variante === 'centered';
      const isBlock = variante === 'block';

      return (
        <Document>
          <Page size="A4" style={[styles.pageMinimalista, isBlock ? { paddingTop: 0 } : {}]} wrap={true}>
            
            {/* Header */}
            <View style={[isBlock ? { backgroundColor: accentColor, padding: isSinglePage ? paddingPageMin : 30, color: '#FFF' } : { alignItems: isCentered ? 'center' : 'flex-start', marginBottom: isSinglePage ? Math.max(8, Math.round(20 * factorEscala)) : 20 }]}>
               {showPhoto && foto_perfil_url && (
                  <Image src={foto_perfil_url} style={[styles.profileImageMin]} />
               )}
               <View style={{ width: '100%' }}>
                   <Text style={[styles.name, isBlock ? { color: '#FFF' } : { color: '#111827' }, isCentered ? { textAlign: 'center' } : {}]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
                    {styling?.showCarrera !== false && (
                        <Text style={[styles.title, isBlock ? { color: 'rgba(255,255,255,0.8)' } : { color: accentColor }, isCentered ? { textAlign: 'center' } : {}]}>{carrera}</Text>
                    )}
                   <Text style={[styles.textRight, isBlock ? { color: 'rgba(255,255,255,0.9)' } : {}, isCentered ? { textAlign: 'center' } : {}]}>{correo} | {municipio}, {estado}</Text>
               </View>
            </View>

            <View style={isBlock ? { padding: isSinglePage ? paddingPageMin : 30 } : {}}>
                {sectionsConfig.map(s => {
                    if (!s.visible) return null;
                    switch (s.id) {
                        case 'habilidades':
                            return habilidades && habilidades.length > 0 && (
                                <View key="hab" style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: isSinglePage ? Math.max(8, Math.round(15 * factorEscala)) : 15, justifyContent: isCentered ? 'center' : 'flex-start' }}>
                                   {habilidades.map((hab, i) => (
                                      <View key={i} style={[styles.pillMin, isBlock ? { borderColor: accentColor } : {}]}>
                                         <Text style={{ fontSize: sizes.text - 0.5, color: '#374151' }}>{hab}</Text>
                                      </View>
                                   ))}
                                </View>
                            );
                        case 'idiomas':
                            return idiomas && idiomas.length > 0 && (
                                <View key="idio" style={{ marginBottom: isSinglePage ? Math.max(8, Math.round(15 * factorEscala)) : 15, alignItems: isCentered ? 'center' : 'flex-start' }}>
                                    <Text style={[styles.sectionTitleRight, { color: accentColor, textAlign: isCentered ? 'center' : 'left', fontSize: sizes.sectionTitleRight, borderBottomColor: accentColor, paddingBottom: 2, marginBottom: 5 }]}>Idiomas</Text>
                                    <Text style={[styles.textEjecutivo, { fontSize: sizes.text, textAlign: isCentered ? 'center' : 'left' }]}>{idiomas.join('  •  ')}</Text>
                                </View>
                            );
                        default:
                            return renderItemRight(s.id, isSinglePage, isCentered);
                    }
                })}
            </View>
          </Page>
        </Document>
      );
  }

  // --- RENDER MINIMALISTA CENTRADO (1 Columna, Alta elegancia, Centrado) ---
  if (baseLayout === 'minimalista_centrado') {
      const paddingPage = isSinglePage ? paddingPageMin : 60;
      const marginBetween = isSinglePage ? Math.max(8, Math.round(25 * factorEscala)) : 25;
      const marginSectionTitle = isSinglePage ? Math.max(4, Math.round(15 * factorEscala)) : 15;

      return (
        <Document>
          <Page size="A4" style={[styles.pageMinimalista, { paddingTop: paddingPage, paddingBottom: paddingPage, paddingHorizontal: isSinglePage ? paddingPageMin : 50 }]} wrap={true}>
            {/* Header Limpio y Centrado */}
            <View style={{ alignItems: 'center', marginBottom: isSinglePage ? Math.max(8, Math.round(30 * factorEscala)) : 30 }}>
               {showPhoto && foto_perfil_url && (
                  <Image src={foto_perfil_url} style={[styles.profileImageMin, { width: profileImageMinSize, height: profileImageMinSize }]} />
               )}
               <Text style={[styles.name, { color: '#111827', textAlign: 'center', marginBottom: isSinglePage ? 4 : 8, fontSize: sizes.name }]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
               {styling?.showCarrera !== false && (
                   <Text style={[styles.title, { color: accentColor, textAlign: 'center', fontSize: sizes.itemTitle, letterSpacing: 1, textTransform: 'uppercase' }]}>{carrera}</Text>
               )}
               <Text style={[styles.textRight, { textAlign: 'center', color: '#6B7280', marginTop: isSinglePage ? 2 : 5 }]}>{correo}</Text>
               {municipio && <Text style={[styles.textRight, { textAlign: 'center', color: '#6B7280' }]}>{municipio}, {estado}</Text>}
            </View>

            <View>
                {/* Iterator */}
                {sectionsConfig.map(s => {
                    if(!s.visible) return null;
                    switch(s.id) {
                        case 'bio':
                            return bio && (
                                <View key="bio" style={{ marginBottom: marginBetween }}>
                                    <View style={{ alignItems: 'center', marginBottom: marginSectionTitle }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>PERFIL PROFESIONAL</Text>
                                    </View>
                                    <Text style={[styles.textRight, { textAlign: 'center', lineHeight: 1.4 }]}>{bio}</Text>
                                </View>
                            );
                        case 'habilidades':
                            return habilidades && habilidades.length > 0 && (
                                <View key="hab" style={{ marginBottom: marginBetween, alignItems: 'center' }}>
                                    <View style={{ alignItems: 'center', marginBottom: marginSectionTitle }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>HABILIDADES</Text>
                                    </View>
                                    <Text style={[styles.textRight, { textAlign: 'center' }]}>{habilidades.join('  •  ')}</Text>
                                </View>
                            );
                        case 'idiomas':
                            return idiomas && idiomas.length > 0 && (
                                <View key="idio" style={{ marginBottom: marginBetween, alignItems: 'center' }}>
                                    <View style={{ alignItems: 'center', marginBottom: marginSectionTitle }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>IDIOMAS</Text>
                                    </View>
                                    <Text style={[styles.textRight, { textAlign: 'center' }]}>{idiomas.join('  •  ')}</Text>
                                </View>
                            );
                        case 'experiencias':
                            return experiencias && experiencias.length > 0 && (
                                <View key="exp" style={{ marginBottom: marginBetween }}>
                                    <View style={{ alignItems: 'center', marginBottom: marginSectionTitle }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>EXPERIENCIA</Text>
                                    </View>
                                    {experiencias.map((exp: any, i: number) => (
                                        <View key={i} style={[styles.experienceBlock, { alignItems: 'center' }]} wrap={false}>
                                            <Text style={[styles.itemTitle, { fontSize: sizes.itemTitle }]}>{exp.puesto}</Text>
                                            <Text style={[styles.itemTitle, { color: accentColor, marginTop: 2 }]}>{exp.empresa}</Text>
                                            <Text style={[styles.itemSubtitle, { marginTop: 2, marginBottom: isSinglePage ? 2 : 8 }]}>{formatDate(exp.fechaInicio)} - {exp.fechaFin ? formatDate(exp.fechaFin) : 'Actualidad'}</Text>
                                            <View style={{ width: '100%' }}>
                                                {(exp.logros || []).map((logro: string, idx: number) => (
                                                    <View key={idx} style={[styles.bulletPointContainer, { justifyContent: 'center' }]}>
                                                        <Text style={[styles.bulletPointBullet, { width: 10, textAlign: 'center' }]}>•</Text>
                                                        <Text style={[styles.bulletPointText, { flex: 0, textAlign: 'left', minWidth: '80%' }]}>{logro}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            );
                        case 'proyectos':
                            return proyectos && proyectos.length > 0 && (
                                <View key="proj" style={{ marginBottom: marginBetween }}>
                                    <View style={{ alignItems: 'center', marginBottom: marginSectionTitle }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>PROYECTOS</Text>
                                    </View>
                                    {proyectos.map((proj: any, i: number) => (
                                        <View key={i} style={[styles.experienceBlock, { alignItems: 'center' }]} wrap={false}>
                                            <Text style={[styles.itemTitle, { fontSize: sizes.itemTitle }]}>{proj.nombre}</Text>
                                            <Text style={[styles.itemSubtitle, { marginTop: 2, marginBottom: isSinglePage ? 2 : 8 }]}>{formatDate(proj.fechaInicio)} - {proj.fechaFin ? formatDate(proj.fechaFin) : 'Actualidad'}</Text>
                                            <View style={{ width: '100%' }}>
                                                {(proj.puntos_clave || []).map((punto: string, idx: number) => (
                                                    <View key={idx} style={[styles.bulletPointContainer, { justifyContent: 'center' }]}>
                                                        <Text style={[styles.bulletPointBullet, { width: 10, textAlign: 'center' }]}>•</Text>
                                                        <Text style={[styles.bulletPointText, { flex: 0, textAlign: 'left', minWidth: '80%' }]}>{punto}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            );
                        case 'educacion_extra':
                            return educacion_extra && educacion_extra.length > 0 && (
                                <View key="edu" style={{ marginBottom: marginBetween }}>
                                    <View style={{ alignItems: 'center', marginBottom: marginSectionTitle }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>EDUCACIÓN</Text>
                                    </View>
                                    {educacion_extra.map((edu: any, i: number) => (
                                        <View key={i} style={{ marginBottom: isSinglePage ? 4 : 12, alignItems: 'center' }} wrap={false}>
                                            <Text style={[styles.itemTitle, { fontSize: sizes.subText }]}>{edu.titulo}</Text>
                                            <Text style={[styles.textRight, { marginTop: 2 }]}>{edu.institucion} {edu.año ? `(${edu.año})` : ''}</Text>
                                        </View>
                                    ))}
                                </View>
                            );
                    }
                })}
            </View>
          </Page>
        </Document>
      );
  }

  // --- RENDER CREATIVO VISUAL (1 Columna, Elementos Encapsulados (Cards)) ---
  if (baseLayout === 'creativo') {
      const paddingCard = isSinglePage ? Math.max(8, Math.round(20 * factorEscala)) : 20;
      const marginCard = isSinglePage ? Math.max(5, Math.round(15 * factorEscala)) : 15;

      return (
        <Document>
          <Page size="A4" style={[styles.pageMinimalista, { paddingTop: isSinglePage ? paddingPageMin : 40, paddingBottom: isSinglePage ? paddingPageMin : 40, paddingHorizontal: isSinglePage ? paddingPageMin : 40, backgroundColor: '#FAFAFA' }]} wrap={true}>
            
            {/* Header Hero */}
            <View style={{ alignItems: 'center', backgroundColor: '#FFFFFF', padding: paddingCard, borderRadius: 12, marginBottom: isSinglePage ? Math.max(6, Math.round(20 * factorEscala)) : 20, borderTopWidth: 4, borderTopColor: accentColor }}>
               {showPhoto && foto_perfil_url && (
                  <Image src={foto_perfil_url} style={{ width: profileImageSize, height: profileImageSize, borderRadius: profileImageSize / 2, alignSelf: 'center', marginBottom: isSinglePage ? 6 : 15, objectFit: 'cover' }} />
               )}
               <Text style={[styles.name, { color: '#1F2937', textAlign: 'center', fontSize: sizes.name }]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
               {styling?.showCarrera !== false && (
                   <Text style={[styles.title, { color: accentColor, textAlign: 'center', fontSize: sizes.itemTitle, fontWeight: 'bold' }]}>{carrera}</Text>
               )}
               <View style={{ flexDirection: 'row', marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                       <View style={{ width: 14, marginRight: 4, justifyContent: 'center', alignItems: 'center' }}>
                         
                       </View>
                       <Text style={{ fontSize: 10, color: '#4B5563' }}>{correo}</Text>
                   </View>
                   {municipio && (
                       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                           <View style={{ width: 14, marginRight: 4, justifyContent: 'center', alignItems: 'center' }}>
                             
                           </View>
                           <Text style={{ fontSize: 10, color: '#4B5563' }}>{municipio}, {estado}</Text>
                       </View>
                   )}
               </View>
            </View>

            <View>
                {/* Iterator */}
                {sectionsConfig.map(s => {
                    if(!s.visible) return null;
                    switch(s.id) {
                        case 'bio':
                            return bio && (
                                <View key="bio" style={{ backgroundColor: '#FFFFFF', padding: paddingCard, borderRadius: 8, marginBottom: marginCard, borderLeftWidth: 3, borderLeftColor: accentColor }} wrap={false}>
                                    <Text style={[styles.sectionTitleRight, { color: accentColor, marginTop: 0, marginBottom: 8, borderBottomWidth: 0 }]}>Perfil</Text>
                                    <Text style={[styles.textRight, { lineHeight: 1.4 }]}>{bio}</Text>
                                </View>
                            );
                        case 'habilidades':
                            return habilidades && habilidades.length > 0 && (
                                <View key="hab" style={{ backgroundColor: '#FFFFFF', padding: paddingCard, borderRadius: 8, marginBottom: marginCard }} wrap={false}>
                                    <Text style={[styles.sectionTitleRight, { color: accentColor, marginTop: 0, marginBottom: 12, borderBottomWidth: 0 }]}>Habilidades Core</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {habilidades.map((hab, i) => (
                                            <View key={i} style={{ backgroundColor: accentColor, paddingVertical: isSinglePage ? 2 : 4, paddingHorizontal: isSinglePage ? 6 : 10, borderRadius: 15, marginRight: isSinglePage ? 4 : 8, marginBottom: isSinglePage ? 4 : 8 }}>
                                                <Text style={{ fontSize: sizes.subText, color: '#FFFFFF' }}>{hab}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            );
                        case 'experiencias':
                            return experiencias && experiencias.length > 0 && (
                                <View key="exp" style={{ marginBottom: marginCard }}>
                                    <Text style={[styles.sectionTitleRight, { color: accentColor, marginLeft: 5 }]}>Trayectoria</Text>
                                    {experiencias.map((exp: any, i: number) => (
                                        <View key={i} style={{ backgroundColor: '#FFFFFF', padding: paddingCard, borderRadius: 8, marginBottom: 10 }} wrap={false}>
                                            <Text style={[styles.itemTitle, { fontSize: sizes.itemTitle }]}>{exp.puesto}</Text>
                                            <Text style={[styles.itemSubtitle, { color: accentColor, fontSize: sizes.subText, marginTop: 2, marginBottom: 6 }]}>{exp.empresa} | {formatDate(exp.fechaInicio)} - {exp.fechaFin ? formatDate(exp.fechaFin) : 'Actualidad'}</Text>
                                            <View style={{ marginTop: 5 }}>
                                                {(exp.logros || []).map((logro: string, idx: number) => (
                                                    <View key={idx} style={styles.bulletPointContainer}>
                                                        <Text style={styles.bulletPointBullet}>•</Text>
                                                        <Text style={styles.bulletPointText}>{logro}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            );
                        case 'proyectos':
                            return proyectos && proyectos.length > 0 && (
                                <View key="proj" style={{ marginBottom: marginCard }}>
                                    <Text style={[styles.sectionTitleRight, { color: accentColor, marginLeft: 5 }]}>Proyectos</Text>
                                    {proyectos.map((proj: any, i: number) => (
                                        <View key={i} style={{ backgroundColor: '#FFFFFF', padding: paddingCard, borderRadius: 8, marginBottom: 10 }} wrap={false}>
                                            <Text style={[styles.itemTitle, { fontSize: sizes.itemTitle }]}>{proj.nombre}</Text>
                                            <Text style={[styles.itemSubtitle, { color: '#6B7280', fontSize: sizes.subText, marginTop: 2, marginBottom: 6 }]}>{formatDate(proj.fechaInicio)} - {proj.fechaFin ? formatDate(proj.fechaFin) : 'Actualidad'}</Text>
                                            <View style={{ marginTop: 5 }}>
                                                {(proj.puntos_clave || []).map((punto: string, idx: number) => (
                                                    <View key={idx} style={styles.bulletPointContainer}>
                                                        <Text style={styles.bulletPointBullet}>•</Text>
                                                        <Text style={styles.bulletPointText}>{punto}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            );
                        case 'educacion_extra':
                        case 'idiomas':
                            return null;
                    }
                })}
            </View>
          </Page>
        </Document>
      );
  }

  // --- RENDER TRADICIONAL ACADÉMICO (Serif puro, justificado, sin foto, derechizado) ---
  if (baseLayout === 'tradicional') {
      const marginBetween = isSinglePage ? Math.max(5, Math.round(15 * factorEscala)) : 15;
      const marginItem = isSinglePage ? Math.max(3, Math.round(10 * factorEscala)) : 10;

      return (
        <Document>
          <Page size="A4" style={[styles.pageEjecutivo, { paddingTop: isSinglePage ? Math.max(15, Math.round(25 * factorEscala)) : 45, paddingHorizontal: isSinglePage ? Math.max(20, Math.round(30 * factorEscala)) : 45 }]} wrap={true}>
            {/* Header Académico Text Only */}
            <View style={{ alignItems: 'center', marginBottom: isSinglePage ? Math.max(6, Math.round(20 * factorEscala)) : 20, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: isSinglePage ? Math.max(4, Math.round(15 * factorEscala)) : 15 }}>
               <Text style={[styles.nameEjecutivo, { color: '#000', fontSize: sizes.nameEjecutivo, textAlign: 'center', textTransform: 'uppercase' }]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
               {styling?.showCarrera !== false && (
                   <Text style={[styles.titleEjecutivo, { color: '#333', textAlign: 'center', marginTop: 5, fontSize: sizes.itemTitle }]}>{carrera}</Text>
               )}
               <Text style={[styles.textEjecutivo, { textAlign: 'center', marginTop: 5, fontSize: sizes.text }]}>{correo} {municipio ? ` | ${municipio}, ${estado}` : ''}</Text>
            </View>

            <View>
                {/* Iterator */}
                {sectionsConfig.map(s => {
                    if(!s.visible) return null;
                    switch(s.id) {
                        case 'bio':
                            return bio && (
                                <View key="bio" style={{ marginBottom: marginBetween }} wrap={false}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>PERFIL PROFESIONAL</Text>
                                    <Text style={[styles.textEjecutivo, { textAlign: 'justify' }]}>{bio}</Text>
                                </View>
                            );
                        case 'habilidades':
                            return habilidades && habilidades.length > 0 && (
                                <View key="hab" style={{ marginBottom: marginBetween }} wrap={false}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>HABILIDADES</Text>
                                    <Text style={[styles.textEjecutivo, { textAlign: 'center' }]}>{habilidades.join('  •  ')}</Text>
                                </View>
                            );
                        case 'idiomas':
                            return idiomas && idiomas.length > 0 && (
                                <View key="idio" style={{ marginBottom: marginBetween }} wrap={false}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>IDIOMAS</Text>
                                    <Text style={[styles.textEjecutivo, { textAlign: 'center' }]}>{idiomas.join('  •  ')}</Text>
                                </View>
                            );
                        case 'experiencias':
                            return experiencias && experiencias.length > 0 && (
                                <View key="exp" style={{ marginBottom: marginBetween }}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>EXPERIENCIA PROFESIONAL</Text>
                                    {experiencias.map((exp: any, i: number) => (
                                        <View key={i} style={{ marginBottom: marginItem }} wrap={false}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'nowrap' }}>
                                                <Text style={[styles.itemTitleEjecutivo, { color: '#000', fontSize: sizes.itemTitle }]}>{exp.puesto}, <Text style={{ fontFamily: 'Times-Italic', fontWeight: 'normal' }}>{exp.empresa}</Text></Text>
                                                <Text style={[styles.textEjecutivo, { fontSize: sizes.subText, textAlign: 'right' }]}>{formatDate(exp.fechaInicio)} - {exp.fechaFin ? formatDate(exp.fechaFin) : 'Actualidad'}</Text>
                                            </View>
                                            <View style={{ marginTop: 4 }}>
                                                {(exp.logros || []).map((logro: string, idx: number) => (
                                                    <View key={idx} style={styles.bulletPointContainer}>
                                                        <Text style={[styles.bulletPointBullet, { fontFamily: 'Times-Roman', color: '#000' }]}>-</Text>
                                                        <Text style={[styles.bulletPointText, { fontFamily: 'Times-Roman', color: '#000', textAlign: 'justify' }]}>{logro}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            );
                        case 'proyectos':
                            return proyectos && proyectos.length > 0 && (
                                <View key="proj" style={{ marginBottom: marginBetween }}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>PROYECTOS ACADÉMICOS</Text>
                                    {proyectos.map((proj: any, i: number) => (
                                        <View key={i} style={{ marginBottom: marginItem }} wrap={false}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'nowrap' }}>
                                                <Text style={[styles.itemTitleEjecutivo, { color: '#000', fontSize: sizes.itemTitle }]}>{proj.nombre}</Text>
                                                <Text style={[styles.textEjecutivo, { fontSize: sizes.subText, textAlign: 'right' }]}>{formatDate(proj.fechaInicio)} - {proj.fechaFin ? formatDate(proj.fechaFin) : 'Actualidad'}</Text>
                                            </View>
                                            <View style={{ marginTop: 4 }}>
                                                {(proj.puntos_clave || []).map((punto: string, idx: number) => (
                                                    <View key={idx} style={styles.bulletPointContainer}>
                                                        <Text style={[styles.bulletPointBullet, { fontFamily: 'Times-Roman', color: '#000' }]}>-</Text>
                                                        <Text style={[styles.bulletPointText, { fontFamily: 'Times-Roman', color: '#000', textAlign: 'justify' }]}>{punto}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            );
                        case 'educacion_extra':
                            return educacion_extra && educacion_extra.length > 0 && (
                                <View key="edu" style={{ marginBottom: marginBetween }}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>EDUCACIÓN SECUNDARIA</Text>
                                    {educacion_extra.map((edu: any, i: number) => (
                                        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'nowrap', marginBottom: 4 }} wrap={false}>
                                            <Text style={[styles.itemTitleEjecutivo, { color: '#000', fontSize: sizes.itemTitle }]}>{edu.titulo}, <Text style={{ fontFamily: 'Times-Italic', fontWeight: 'normal' }}>{edu.institucion}</Text></Text>
                                            <Text style={[styles.textEjecutivo, { fontSize: sizes.subText, textAlign: 'right' }]}>{edu.año ? `${edu.año}` : ''}</Text>
                                        </View>
                                    ))}
                                </View>
                            );
                    }
                })}
            </View>
          </Page>
        </Document>
      );
  }

  // --- RENDER EJECUTIVO (Tipografía Times, Formal) ---
  const isClean = variante === 'clean';
  const isSpacious = variante === 'spacious';
  const marginSection = isSinglePage ? Math.max(5, Math.round(15 * factorEscala)) : 15;
  const paddingHeader = isSinglePage ? Math.max(4, Math.round(15 * factorEscala)) : 15;
  const marginHeader = isSinglePage ? Math.max(5, Math.round(20 * factorEscala)) : 20;

  return (
        <Document>
          <Page size="A4" style={[styles.pageEjecutivo, isSpacious ? { padding: isSinglePage ? paddingPageEj : 45 } : { padding: paddingPageEj }]} wrap={true}>
            {/* Header Clasico */}
            <View style={[styles.headerEjecutivo, { borderBottomColor: isClean ? 'transparent' : accentColor, paddingBottom: paddingHeader, marginBottom: marginHeader }]}>
               {showPhoto && foto_perfil_url && (
                  <Image src={foto_perfil_url} style={[styles.profileImageEjecutivo]} />
               )}
               <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={[styles.nameEjecutivo, { color: accentColor, fontSize: sizes.nameEjecutivo }]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
                    {styling?.showCarrera !== false && (
                         <Text style={[styles.titleEjecutivo, { fontSize: sizes.itemTitle }]}>{carrera.toUpperCase()}</Text>
                     )}
                    <Text style={[styles.textEjecutivo, { fontSize: sizes.text }]}>{correo} • {municipio}, {estado}</Text>
               </View>
            </View>

            {/* In Ejecutivo, everything flows top to bottom based on section order */}
            {sectionsConfig.map(s => {
                if(!s.visible) return null;
                
                switch(s.id) {
                    case 'bio':
                        return bio && (
                            <View key="bio" style={{ marginBottom: marginSection }} wrap={false}>
                                <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor, paddingBottom: isSinglePage ? 3 : 5, marginBottom: isSinglePage ? 4 : 8 }]}>PERFIL PROFESIONAL</Text>
                                <Text style={styles.textEjecutivo}>{bio}</Text>
                            </View>
                        );
                    
                    case 'habilidades': // We combine habilidades with idiomas in Ejecutivo if both visible, otherwise just one
                    case 'idiomas': 
                        if (s.id === 'idiomas') return null; // handled gracefully within habilidades
                        return (
                            <View key="hab-id" style={{ flexDirection: 'row', marginBottom: marginSection }} wrap={false}>
                                {isVisible('habilidades') && (
                                    <View style={{ width: isVisible('idiomas') ? '50%' : '100%', paddingRight: 10 }}>
                                        <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor, paddingBottom: isSinglePage ? 3 : 5, marginBottom: isSinglePage ? 4 : 8 }]}>HABILIDADES CLAVE</Text>
                                        <Text style={[styles.textEjecutivo, { textAlign: 'justify', lineHeight: 1.4 }]}>
                                            {(habilidades || []).join('  •  ')}
                                        </Text>
                                    </View>
                                )}
                                {isVisible('idiomas') && (
                                    <View style={{ width: isVisible('habilidades') ? '50%' : '100%', paddingLeft: isVisible('habilidades') ? 10 : 0 }}>
                                         <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor, paddingBottom: isSinglePage ? 3 : 5, marginBottom: isSinglePage ? 4 : 8 }]}>IDIOMAS</Text>
                                         <Text style={[styles.textEjecutivo, { textAlign: 'justify', lineHeight: 1.4 }]}>
                                            {(idiomas || []).join('  •  ')}
                                         </Text>
                                    </View>
                                )}
                            </View>
                        );

                    case 'experiencias':
                        return experiencias && experiencias.length > 0 && (
                            <View key="exp" style={{ marginBottom: marginSection }}>
                                <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor, paddingBottom: isSinglePage ? 3 : 5, marginBottom: isSinglePage ? 4 : 8 }]}>TRAYECTORIA LABORAL</Text>
                                {experiencias.map((exp: any, i: number) => (
                                    <View key={i} style={[styles.experienceBlock, { marginBottom: isSinglePage ? Math.max(3, Math.round(12 * factorEscala)) : 12 }]} wrap={false}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <Text style={styles.itemTitleEjecutivo}>{exp.empresa}</Text>
                                            <Text style={styles.itemSubtitleEjecutivo}>{formatDate(exp.fechaInicio)} - {exp.fechaFin ? formatDate(exp.fechaFin) : 'Actualidad'}</Text>
                                        </View>
                                        <Text style={[styles.itemTitleEjecutivo, { fontSize: sizes.text, marginBottom: 4 }]}>{exp.puesto}</Text>
                                        {(exp.logros || []).map((logro: string, idx: number) => (
                                            <View key={idx} style={styles.bulletPointContainer}>
                                                <Text style={styles.bulletPointBullet}>-</Text>
                                                <Text style={[styles.bulletPointText, { fontFamily: 'Times-Roman' }]}>{logro}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        );

                    case 'proyectos':
                        return proyectos && proyectos.length > 0 && (
                            <View key="proj" style={{ marginBottom: marginSection }}>
                                <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor, paddingBottom: isSinglePage ? 3 : 5, marginBottom: isSinglePage ? 4 : 8 }]}>PROYECTOS DESTACADOS</Text>
                                {proyectos.map((proj: any, i: number) => (
                                    <View key={i} style={[styles.experienceBlock, { marginBottom: isSinglePage ? Math.max(3, Math.round(12 * factorEscala)) : 12 }]} wrap={false}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <Text style={styles.itemTitleEjecutivo}>{proj.nombre}</Text>
                                            <Text style={styles.itemSubtitleEjecutivo}>{formatDate(proj.fechaInicio)} - {proj.fechaFin ? formatDate(proj.fechaFin) : 'Actualidad'}</Text>
                                        </View>
                                        {(proj.puntos_clave || []).map((punto: string, idx: number) => (
                                            <View key={idx} style={styles.bulletPointContainer}>
                                                <Text style={styles.bulletPointBullet}>-</Text>
                                                <Text style={[styles.bulletPointText, { fontFamily: 'Times-Roman' }]}>{punto}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        );

                    case 'educacion_extra':
                        return educacion_extra && educacion_extra.length > 0 && (
                            <View key="edu" style={{ marginBottom: marginSection }}>
                                <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor, paddingBottom: isSinglePage ? 3 : 5, marginBottom: isSinglePage ? 4 : 8 }]}>FORMACIÓN ACADÉMICA</Text>
                                {educacion_extra.map((edu: any, i: number) => (
                                    <View key={i} style={{ marginBottom: isSinglePage ? Math.max(2, Math.round(8 * factorEscala)) : 8 }} wrap={false}>
                                        <Text style={styles.itemTitleEjecutivo}>{edu.titulo}</Text>
                                        <Text style={[styles.textEjecutivo, { marginTop: 2 }]}>{edu.institucion} {edu.año ? `(${edu.año})` : ''}</Text>
                                    </View>
                                ))}
                            </View>
                        );
                }
            })}
          </Page>
        </Document>
  );
};