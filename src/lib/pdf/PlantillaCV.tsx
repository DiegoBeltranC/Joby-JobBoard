import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Path } from '@react-pdf/renderer';

// Base Styles mapping
const styles = StyleSheet.create({
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

export const PlantillaCV = ({ data, accentColor = '#0F766E', showPhoto = true, templateInfo }: { data: CVData, accentColor?: string, showPhoto?: boolean, templateInfo?: { base: string, variante: string, sections?: any[] } }) => {
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
                      <View key={i} style={[styles.experienceBlock, isCompact ? { marginBottom: 10 } : {}]}>
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
                      <View key={i} style={[styles.experienceBlock, isCompact ? { marginBottom: 10 } : {}]}>
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
                      <View key={i} style={[styles.experienceBlock, isCompact ? { marginBottom: 5 } : {}]}>
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
      const isCompact = variante === 'compact';
      const isCreative = variante === 'creative';

      return (
        <Document>
          <Page size="A4" style={[styles.page, { flexDirection: isInverted ? 'row-reverse' : 'row' }]}>
            <View style={[styles.leftColumn, { backgroundColor: accentColor, width: isCreative ? '40%' : '35%', padding: isCompact ? 15 : 25 }]}>
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
              
              {isVisible('habilidades') && habilidades && habilidades.length > 0 && (
                  <View>
                      <Text style={[styles.sectionTitleLeft, isCreative ? { borderBottomWidth: 0, fontSize: 16 } : {}]}>Habilidades</Text>
                      {habilidades.map((hab, i) => (
                        <View key={i} style={[styles.pill, isCompact ? { paddingVertical: 3, marginBottom: 3 } : {}]}>
                          <Text style={{ fontSize: 10, color: '#FFFFFF' }}>{hab}</Text>
                        </View>
                      ))}
                  </View>
              )}

              {isVisible('idiomas') && idiomas && idiomas.length > 0 && (
                  <View>
                      <Text style={[styles.sectionTitleLeft, isCreative ? { borderBottomWidth: 0, fontSize: 16 } : {}]}>Idiomas</Text>
                      {idiomas.map((idioma, i) => (
                        <Text key={i} style={styles.textLeft}>• {idioma}</Text>
                      ))}
                  </View>
              )}
            </View>

            <View style={[styles.rightColumn, { width: isCreative ? '60%' : '65%', padding: isCompact ? 20 : 30 }]}>
              <View style={{ width: '100%', marginBottom: 15 }}>
                  <Text style={[styles.name, { color: '#111827' }]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
                  <Text style={[styles.title, { color: accentColor }]}>{carrera}</Text>
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
          <Page size="A4" style={[styles.pageMinimalista, isBlock ? { paddingTop: 0 } : {}]}>
            
            {/* Header */}
            <View style={[isBlock ? { backgroundColor: accentColor, padding: 30, color: '#FFF' } : { alignItems: isCentered ? 'center' : 'flex-start', marginBottom: 20 }]}>
               {showPhoto && foto_perfil_url && (
                  <Image src={foto_perfil_url} style={[styles.profileImageMin]} />
               )}
               <View style={{ width: '100%' }}>
                   <Text style={[styles.name, isBlock ? { color: '#FFF' } : { color: '#111827' }, isCentered ? { textAlign: 'center' } : {}]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
                   <Text style={[styles.title, isBlock ? { color: 'rgba(255,255,255,0.8)' } : { color: accentColor }, isCentered ? { textAlign: 'center' } : {}]}>{carrera}</Text>
                   <Text style={[styles.textRight, isBlock ? { color: 'rgba(255,255,255,0.9)' } : {}, isCentered ? { textAlign: 'center' } : {}]}>{correo} | {municipio}, {estado}</Text>
               </View>
            </View>

            <View style={isBlock ? { padding: 30 } : {}}>
                {isVisible('habilidades') && habilidades && habilidades.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, justifyContent: isCentered ? 'center' : 'flex-start' }}>
                       {habilidades.map((hab, i) => (
                          <View key={i} style={[styles.pillMin, isBlock ? { borderColor: accentColor } : {}]}>
                             <Text style={{ fontSize: 9, color: '#374151' }}>{hab}</Text>
                          </View>
                       ))}
                    </View>
                )}

                {/* Iterate dynamically in correct order for Main Content */}
                {sectionsConfig.filter(s => ['bio', 'experiencias', 'proyectos', 'educacion_extra'].includes(s.id)).map(s => renderItemRight(s.id, false, isCentered))}
            </View>
          </Page>
        </Document>
      );
  }

  // --- RENDER MINIMALISTA CENTRADO (1 Columna, Alta elegancia, Centrado) ---
  if (baseLayout === 'minimalista_centrado') {
      return (
        <Document>
          <Page size="A4" style={[styles.pageMinimalista, { paddingTop: 60, paddingBottom: 60, paddingHorizontal: 50 }]}>
            {/* Header Limpio y Centrado */}
            <View style={{ alignItems: 'center', marginBottom: 30 }}>
               {showPhoto && foto_perfil_url && (
                  <Image src={foto_perfil_url} style={[styles.profileImageMin, { width: 90, height: 90 }]} />
               )}
               <Text style={[styles.name, { color: '#111827', textAlign: 'center', marginBottom: 8, fontSize: 28 }]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
               <Text style={[styles.title, { color: accentColor, textAlign: 'center', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }]}>{carrera}</Text>
               <Text style={[styles.textRight, { textAlign: 'center', color: '#6B7280', marginTop: 5 }]}>{correo}</Text>
               {municipio && <Text style={[styles.textRight, { textAlign: 'center', color: '#6B7280' }]}>{municipio}, {estado}</Text>}
            </View>

            <View>
                {/* Iterator */}
                {sectionsConfig.map(s => {
                    if(!s.visible) return null;
                    switch(s.id) {
                        case 'bio':
                            return bio && (
                                <View key="bio" style={{ marginBottom: 25 }}>
                                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>PERFIL PROFESIONAL</Text>
                                    </View>
                                    <Text style={[styles.textRight, { textAlign: 'center', lineHeight: 1.6 }]}>{bio}</Text>
                                </View>
                            );
                        case 'habilidades':
                            return habilidades && habilidades.length > 0 && (
                                <View key="hab" style={{ marginBottom: 25, alignItems: 'center' }}>
                                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>HABILIDADES</Text>
                                    </View>
                                    <Text style={[styles.textRight, { textAlign: 'center' }]}>{habilidades.join('  •  ')}</Text>
                                </View>
                            );
                        case 'idiomas':
                            return idiomas && idiomas.length > 0 && (
                                <View key="idio" style={{ marginBottom: 25, alignItems: 'center' }}>
                                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>IDIOMAS</Text>
                                    </View>
                                    <Text style={[styles.textRight, { textAlign: 'center' }]}>{idiomas.join('  •  ')}</Text>
                                </View>
                            );
                        case 'experiencias':
                            return experiencias && experiencias.length > 0 && (
                                <View key="exp" style={{ marginBottom: 20 }}>
                                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>EXPERIENCIA</Text>
                                    </View>
                                    {experiencias.map((exp: any, i: number) => (
                                        <View key={i} style={[styles.experienceBlock, { alignItems: 'center' }]}>
                                            <Text style={[styles.itemTitle, { fontSize: 13 }]}>{exp.puesto}</Text>
                                            <Text style={[styles.itemTitle, { color: accentColor, marginTop: 2 }]}>{exp.empresa}</Text>
                                            <Text style={[styles.itemSubtitle, { marginTop: 2, marginBottom: 8 }]}>{formatDate(exp.fechaInicio)} - {exp.fechaFin ? formatDate(exp.fechaFin) : 'Actualidad'}</Text>
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
                                <View key="proj" style={{ marginBottom: 20 }}>
                                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>PROYECTOS</Text>
                                    </View>
                                    {proyectos.map((proj: any, i: number) => (
                                        <View key={i} style={[styles.experienceBlock, { alignItems: 'center' }]}>
                                            <Text style={[styles.itemTitle, { fontSize: 13 }]}>{proj.nombre}</Text>
                                            <Text style={[styles.itemSubtitle, { marginTop: 2, marginBottom: 8 }]}>{formatDate(proj.fechaInicio)} - {proj.fechaFin ? formatDate(proj.fechaFin) : 'Actualidad'}</Text>
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
                                <View key="edu" style={{ marginBottom: 20 }}>
                                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                                        <Text style={[styles.sectionTitleRight, { borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 0, color: '#111827' }]}>EDUCACIÓN</Text>
                                    </View>
                                    {educacion_extra.map((edu: any, i: number) => (
                                        <View key={i} style={{ marginBottom: 12, alignItems: 'center' }}>
                                            <Text style={[styles.itemTitle, { fontSize: 12 }]}>{edu.titulo}</Text>
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
      return (
        <Document>
          <Page size="A4" style={[styles.pageMinimalista, { paddingTop: 40, paddingBottom: 40, paddingHorizontal: 40, backgroundColor: '#FAFAFA' }]}>
            
            {/* Header Hero */}
            <View style={{ alignItems: 'center', backgroundColor: '#FFFFFF', padding: 25, borderRadius: 12, marginBottom: 20, borderTopWidth: 4, borderTopColor: accentColor, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 }}>
               {showPhoto && foto_perfil_url && (
                  <Image src={foto_perfil_url} style={{ width: 110, height: 110, borderRadius: 55, alignSelf: 'center', marginBottom: 15, objectFit: 'cover' }} />
               )}
               <Text style={[styles.name, { color: '#1F2937', textAlign: 'center', fontSize: 26 }]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
               <Text style={[styles.title, { color: accentColor, textAlign: 'center', fontSize: 14, fontWeight: 'bold' }]}>{carrera}</Text>
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
                                <View key="bio" style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: accentColor }}>
                                    <Text style={[styles.sectionTitleRight, { color: accentColor, marginTop: 0, marginBottom: 8, borderBottomWidth: 0 }]}>Perfil</Text>
                                    <Text style={[styles.textRight, { lineHeight: 1.5 }]}>{bio}</Text>
                                </View>
                            );
                        case 'habilidades':
                            return habilidades && habilidades.length > 0 && (
                                <View key="hab" style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, marginBottom: 15 }}>
                                    <Text style={[styles.sectionTitleRight, { color: accentColor, marginTop: 0, marginBottom: 12, borderBottomWidth: 0 }]}>Habilidades Core</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {habilidades.map((hab, i) => (
                                            <View key={i} style={{ backgroundColor: accentColor, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 15, marginRight: 8, marginBottom: 8 }}>
                                                <Text style={{ fontSize: 10, color: '#FFFFFF' }}>{hab}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            );
                        case 'experiencias':
                            return experiencias && experiencias.length > 0 && (
                                <View key="exp" style={{ marginBottom: 15 }}>
                                    <Text style={[styles.sectionTitleRight, { color: accentColor, marginLeft: 5 }]}>Trayectoria</Text>
                                    {experiencias.map((exp: any, i: number) => (
                                        <View key={i} style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, marginBottom: 10 }}>
                                            <Text style={[styles.itemTitle, { fontSize: 14 }]}>{exp.puesto}</Text>
                                            <Text style={[styles.itemSubtitle, { color: accentColor, fontSize: 11, marginTop: 2, marginBottom: 6 }]}>{exp.empresa} | {formatDate(exp.fechaInicio)} - {exp.fechaFin ? formatDate(exp.fechaFin) : 'Actualidad'}</Text>
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
                                <View key="proj" style={{ marginBottom: 15 }}>
                                    <Text style={[styles.sectionTitleRight, { color: accentColor, marginLeft: 5 }]}>Proyectos</Text>
                                    {proyectos.map((proj: any, i: number) => (
                                        <View key={i} style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, marginBottom: 10 }}>
                                            <Text style={[styles.itemTitle, { fontSize: 14 }]}>{proj.nombre}</Text>
                                            <Text style={[styles.itemSubtitle, { color: '#6B7280', fontSize: 10, marginTop: 2, marginBottom: 6 }]}>{formatDate(proj.fechaInicio)} - {proj.fechaFin ? formatDate(proj.fechaFin) : 'Actualidad'}</Text>
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
                            return null; // Omitted for brevity or combine similarly
                    }
                })}
            </View>
          </Page>
        </Document>
      );
  }

  // --- RENDER TRADICIONAL ACADÉMICO (Serif puro, justificado, sin foto, derechizado) ---
  if (baseLayout === 'tradicional') {
      return (
        <Document>
          <Page size="A4" style={[styles.pageEjecutivo, { paddingTop: 45, paddingHorizontal: 45 }]}>
            {/* Header Académico Text Only */}
            <View style={{ alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 15 }}>
               <Text style={[styles.nameEjecutivo, { color: '#000', fontSize: 26, textAlign: 'center', textTransform: 'uppercase' }]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
               <Text style={[styles.titleEjecutivo, { color: '#333', textAlign: 'center', marginTop: 5 }]}>{carrera}</Text>
               <Text style={[styles.textEjecutivo, { textAlign: 'center', marginTop: 5 }]}>{correo} {municipio ? ` | ${municipio}, ${estado}` : ''}</Text>
            </View>

            <View>
                {/* Iterator */}
                {sectionsConfig.map(s => {
                    if(!s.visible) return null;
                    switch(s.id) {
                        case 'bio':
                            return bio && (
                                <View key="bio" style={{ marginBottom: 15 }}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>PERFIL PROFESIONAL</Text>
                                    <Text style={[styles.textEjecutivo, { textAlign: 'justify' }]}>{bio}</Text>
                                </View>
                            );
                        case 'habilidades':
                            return habilidades && habilidades.length > 0 && (
                                <View key="hab" style={{ marginBottom: 15 }}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>HABILIDADES</Text>
                                    <Text style={[styles.textEjecutivo, { textAlign: 'center' }]}>{habilidades.join('  •  ')}</Text>
                                </View>
                            );
                        case 'idiomas':
                            return idiomas && idiomas.length > 0 && (
                                <View key="idio" style={{ marginBottom: 15 }}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>IDIOMAS</Text>
                                    <Text style={[styles.textEjecutivo, { textAlign: 'center' }]}>{idiomas.join('  •  ')}</Text>
                                </View>
                            );
                        case 'experiencias':
                            return experiencias && experiencias.length > 0 && (
                                <View key="exp" style={{ marginBottom: 15 }}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>EXPERIENCIA PROFESIONAL</Text>
                                    {experiencias.map((exp: any, i: number) => (
                                        <View key={i} style={{ marginBottom: 10 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'nowrap' }}>
                                                <Text style={[styles.itemTitleEjecutivo, { color: '#000', fontSize: 12 }]}>{exp.puesto}, <Text style={{ fontFamily: 'Times-Italic', fontWeight: 'normal' }}>{exp.empresa}</Text></Text>
                                                <Text style={[styles.textEjecutivo, { fontSize: 10, textAlign: 'right' }]}>{formatDate(exp.fechaInicio)} - {exp.fechaFin ? formatDate(exp.fechaFin) : 'Actualidad'}</Text>
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
                                <View key="proj" style={{ marginBottom: 15 }}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>PROYECTOS ACADÉMICOS</Text>
                                    {proyectos.map((proj: any, i: number) => (
                                        <View key={i} style={{ marginBottom: 10 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'nowrap' }}>
                                                <Text style={[styles.itemTitleEjecutivo, { color: '#000', fontSize: 12 }]}>{proj.nombre}</Text>
                                                <Text style={[styles.textEjecutivo, { fontSize: 10, textAlign: 'right' }]}>{formatDate(proj.fechaInicio)} - {proj.fechaFin ? formatDate(proj.fechaFin) : 'Actualidad'}</Text>
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
                                <View key="edu" style={{ marginBottom: 15 }}>
                                    <Text style={[styles.sectionTitleEjecutivo, { borderBottomWidth: 1, borderBottomColor: '#000', color: '#000', textAlign: 'center' }]}>EDUCACIÓN SECUNDARIA</Text>
                                    {educacion_extra.map((edu: any, i: number) => (
                                        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'nowrap', marginBottom: 4 }}>
                                            <Text style={[styles.itemTitleEjecutivo, { color: '#000', fontSize: 12 }]}>{edu.titulo}, <Text style={{ fontFamily: 'Times-Italic', fontWeight: 'normal' }}>{edu.institucion}</Text></Text>
                                            <Text style={[styles.textEjecutivo, { fontSize: 10, textAlign: 'right' }]}>{edu.año ? `${edu.año}` : ''}</Text>
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

  return (
        <Document>
          <Page size="A4" style={[styles.pageEjecutivo, isSpacious ? { padding: 45 } : {}]}>
            {/* Header Clasico */}
            <View style={[styles.headerEjecutivo, { borderBottomColor: isClean ? 'transparent' : accentColor }]}>
               {showPhoto && foto_perfil_url && (
                  <Image src={foto_perfil_url} style={styles.profileImageEjecutivo} />
               )}
               <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={[styles.nameEjecutivo, { color: accentColor }]}>{nombre} {apellidoPaterno} {apellidoMaterno || ''}</Text>
                    <Text style={styles.titleEjecutivo}>{carrera.toUpperCase()}</Text>
                    <Text style={styles.textEjecutivo}>{correo} • {municipio}, {estado}</Text>
               </View>
            </View>

            {/* In Ejecutivo, everything flows top to bottom based on section order */}
            {sectionsConfig.map(s => {
                if(!s.visible) return null;
                
                switch(s.id) {
                    case 'bio':
                        return bio && (
                            <View key="bio" style={{ marginBottom: 15 }}>
                                <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor }]}>PERFIL PROFESIONAL</Text>
                                <Text style={styles.textEjecutivo}>{bio}</Text>
                            </View>
                        );
                    
                    case 'habilidades': // We combine habilidades with idiomas in Ejecutivo if both visible, otherwise just one
                    case 'idiomas': 
                        if (s.id === 'idiomas') return null; // handled gracefully within habilidades
                        return (
                            <View key="hab-id" style={{ flexDirection: 'row', marginBottom: 15 }}>
                                {isVisible('habilidades') && (
                                    <View style={{ width: isVisible('idiomas') ? '50%' : '100%', paddingRight: 10 }}>
                                        <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor }]}>HABILIDADES CLAVE</Text>
                                        {(habilidades || []).map((hab, i) => (
                                            <Text key={i} style={styles.textEjecutivo}>• {hab}</Text>
                                        ))}
                                    </View>
                                )}
                                {isVisible('idiomas') && (
                                    <View style={{ width: isVisible('habilidades') ? '50%' : '100%', paddingLeft: isVisible('habilidades') ? 10 : 0 }}>
                                         <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor }]}>IDIOMAS</Text>
                                         {(idiomas || []).map((idioma, i) => (
                                            <Text key={i} style={styles.textEjecutivo}>• {idioma}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );

                    case 'experiencias':
                        return experiencias && experiencias.length > 0 && (
                            <View key="exp">
                                <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor }]}>TRAYECTORIA LABORAL</Text>
                                {experiencias.map((exp: any, i: number) => (
                                    <View key={i} style={styles.experienceBlock}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <Text style={styles.itemTitleEjecutivo}>{exp.empresa}</Text>
                                            <Text style={styles.itemSubtitleEjecutivo}>{formatDate(exp.fechaInicio)} - {exp.fechaFin ? formatDate(exp.fechaFin) : 'Actualidad'}</Text>
                                        </View>
                                        <Text style={[styles.itemTitleEjecutivo, { fontSize: 11, marginBottom: 4 }]}>{exp.puesto}</Text>
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
                            <View key="proj">
                                <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor }]}>PROYECTOS DESTACADOS</Text>
                                {proyectos.map((proj: any, i: number) => (
                                    <View key={i} style={styles.experienceBlock}>
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
                            <View key="edu">
                                <Text style={[styles.sectionTitleEjecutivo, { borderBottomColor: isClean ? 'transparent' : '#E5E7EB', color: accentColor }]}>FORMACIÓN ACADÉMICA</Text>
                                {educacion_extra.map((edu: any, i: number) => (
                                    <View key={i} style={{ marginBottom: 8 }}>
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
