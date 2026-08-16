import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { PreRegistrationLead } from '../types';

/**
 * Sanitizes object by removing `undefined` values to prevent Firestore unsupported field value errors.
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Saves a pre-registration lead directly to Firebase Firestore with fallback to the local API.
 */
export async function saveLead(leadData: PreRegistrationLead): Promise<{ success: boolean; id?: string; source: 'firestore' | 'api' }> {
  const sanitized = sanitizeForFirestore({
    name: leadData.name.trim(),
    email: leadData.email.trim().toLowerCase(),
    phone: leadData.phone.trim(),
    area: leadData.area || 'Geral',
    knownTechs: Array.isArray(leadData.knownTechs) ? leadData.knownTechs : [],
    customTechs: leadData.customTechs?.trim() || '',
    hasCourse: leadData.hasCourse || 'Não informado',
    courseDetails: leadData.courseDetails?.trim() || '',
    jobContext: leadData.jobContext ? {
      company: leadData.jobContext.company || '',
      roleTitle: leadData.jobContext.roleTitle || '',
      level: leadData.jobContext.level || '',
      techStack: Array.isArray(leadData.jobContext.techStack) ? leadData.jobContext.techStack : [],
      rawInput: leadData.jobContext.rawInput || ''
    } : null,
    createdAt: leadData.createdAt || new Date().toISOString(),
    status: leadData.status || 'novo'
  });

  let firestoreSuccess = false;
  let firestoreDocId: string | undefined = undefined;

  // 1. Salvar no Firebase Firestore (Banco de Dados Principal)
  try {
    const leadsRef = collection(db, 'leads');
    const docRef = await addDoc(leadsRef, {
      ...sanitized,
      firestoreCreatedAt: serverTimestamp()
    });
    firestoreSuccess = true;
    firestoreDocId = docRef.id;
    console.log('[Firebase Firestore] Lead registrado com sucesso no banco ID:', docRef.id);
  } catch (firestoreError) {
    console.warn('[Firebase Firestore] Erro ao salvar lead diretamente:', firestoreError);
    // Registra erro detalhado usando helper da skill
    try {
      handleFirestoreError(firestoreError, OperationType.CREATE, 'leads');
    } catch (e) {
      // continua para fallback da API
    }
  }

  // 2. Salva em paralelo na API/servidor local para redundância
  let apiSuccess = false;
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...sanitized,
        firestoreId: firestoreDocId
      })
    });
    if (res.ok) {
      apiSuccess = true;
    }
  } catch (apiErr) {
    console.warn('[API Backup] Falha de comunicação com API de leads:', apiErr);
  }

  if (firestoreSuccess) {
    return { success: true, id: firestoreDocId, source: 'firestore' };
  }

  if (apiSuccess) {
    return { success: true, source: 'api' };
  }

  throw new Error('Não foi possível gravar o pré-registro no banco de dados. Verifique a conexão e tente novamente.');
}

/**
 * Fetches all leads from Firebase Firestore or local API.
 */
export async function getLeadsList(): Promise<PreRegistrationLead[]> {
  const leads: PreRegistrationLead[] = [];

  // Tenta buscar no Firebase Firestore
  try {
    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, limit(200));
    const snapshot = await getDocs(q);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      leads.push({
        id: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        area: data.area || 'Geral',
        knownTechs: Array.isArray(data.knownTechs) ? data.knownTechs : [],
        customTechs: data.customTechs || '',
        hasCourse: data.hasCourse || '',
        courseDetails: data.courseDetails || '',
        jobContext: data.jobContext || null,
        createdAt: data.createdAt || new Date().toISOString(),
        status: data.status || 'novo'
      });
    });

    if (leads.length > 0) {
      // Ordenar decrescente por data de criação
      leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return leads;
    }
  } catch (firestoreError) {
    console.warn('[Firebase Firestore] Erro ao buscar leads do Firestore:', firestoreError);
  }

  // Fallback para API do servidor
  try {
    const res = await fetch('/api/leads');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.leads)) {
        return json.leads;
      }
    }
  } catch (apiError) {
    console.warn('[API Backup] Erro ao buscar leads da API:', apiError);
  }

  return leads;
}

/**
 * Deletes a lead by ID from Firestore and local API.
 */
export async function removeLead(leadId: string): Promise<boolean> {
  let deleted = false;

  // Tenta deletar no Firestore
  try {
    const docRef = doc(db, 'leads', leadId);
    await deleteDoc(docRef);
    deleted = true;
  } catch (err) {
    console.warn('[Firebase Firestore] Erro ao deletar lead do Firestore:', err);
  }

  // Deleta na API
  try {
    await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
    deleted = true;
  } catch (err) {
    console.warn('[API Backup] Erro ao deletar lead da API:', err);
  }

  return deleted;
}
