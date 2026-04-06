import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // Utilisation de ton instance api centralisée
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DebtManager = () => {
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null); 
    const [formData, setFormData] = useState({
        contact_name: '',    
        contact_email: '',
        amount: '',          
        type: 'a_recevoir', 
        due_date: '',       
        notes: ''           
    });

    useEffect(() => {
        fetchDebts();
    }, []);

    const fetchDebts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/debts');
            setDebts(res.data);
        } catch (err) {
            console.error("Erreur chargement dettes", err);
        } finally {
            setLoading(false);
        }
    };

    // --- CALCUL DES TOTAUX ---
    const activeDebts = debts.filter(d => d.status === 'en_attente');
    const totalARecevoir = activeDebts.filter(d => d.type === 'a_recevoir').reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const totalAPayer = activeDebts.filter(d => d.type === 'a_payer').reduce((sum, d) => sum + Number(d.amount || 0), 0);

    // --- LOGIQUE PDF ---
    const generatePDF = () => {
        try {
            const doc = new jsPDF();
            const dateStr = new Date().toLocaleDateString('fr-FR');
            
            // Header
            doc.setFontSize(22);
            doc.setTextColor(30, 41, 59);
            doc.text("SILVER FIN", 14, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Rapport des Engagements Financiers", 14, 28);
            doc.text(`Date d'édition : ${dateStr}`, 14, 34);

            // Résumé financier
            doc.setDrawColor(226, 232, 240);
            doc.line(14, 40, 196, 40);
            
            doc.setFontSize(11);
            doc.setTextColor(16, 185, 129);
            doc.text(`TOTAL À RECEVOIR : ${totalARecevoir.toLocaleString()} FCFA`, 14, 48);
            doc.setTextColor(244, 63, 94);
            doc.text(`TOTAL À PAYER : ${totalAPayer.toLocaleString()} FCFA`, 110, 48);

            const toReceive = debts.filter(d => d.type === 'a_recevoir');
            const toPay = debts.filter(d => d.type === 'a_payer');

            // --- TABLEAU 1 : À RECEVOIR ---
            autoTable(doc, {
                startY: 55,
                head: [['Créanciers (À Recevoir)', 'Email', 'Échéance', 'Statut', 'Montant']],
                body: toReceive.map(d => [
                    d.contact_name || 'Inconnu', 
                    d.contact_email || '-', 
                    d.due_date ? new Date(d.due_date).toLocaleDateString('fr-FR') : '-',
                    d.status === 'paye' ? 'RÉGLÉ' : 'EN ATTENTE',
                    `${Number(d.amount || 0).toLocaleString()} F`
                ]),
                headStyles: { fillColor: [16, 185, 129] },
            });

            const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60;

            // --- TABLEAU 2 : À PAYER ---
            autoTable(doc, {
                startY: finalY + 15,
                head: [['Dettes (À Payer)', 'Email', 'Échéance', 'Statut', 'Montant']],
                body: toPay.map(d => [
                    d.contact_name || 'Inconnu', 
                    d.contact_email || '-', 
                    d.due_date ? new Date(d.due_date).toLocaleDateString('fr-FR') : '-',
                    d.status === 'paye' ? 'RÉGLÉ' : 'EN ATTENTE',
                    `${Number(d.amount || 0).toLocaleString()} F`
                ]),
                headStyles: { fillColor: [244, 63, 94] },
            });

            doc.save(`SilverFin_Rapport_${dateStr.replace(/\//g, '-')}.pdf`);
        } catch (error) {
            console.error("Erreur PDF:", error);
            alert("Erreur lors de la génération du PDF.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/debts/${editingId}`, formData);
                setEditingId(null);
            } else {
                await api.post('/debts', formData);
            }
            setFormData({ contact_name: '', contact_email: '', amount: '', type: 'a_recevoir', due_date: '', notes: '' });
            fetchDebts();
        } catch (err) {
            alert(err.response?.data?.message || "Une erreur est survenue.");
        }
    };

    const handleEditClick = (debt) => {
        setEditingId(debt.id);
        setFormData({
            contact_name: debt.contact_name,
            contact_email: debt.contact_email || '',
            amount: debt.amount,
            type: debt.type,
            due_date: debt.due_date.split('T')[0], // Formatage pour input type="date"
            notes: debt.notes || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const markAsPaid = async (id) => {
        try {
            await api.patch(`/debts/${id}/pay`);
            fetchDebts();
        } catch (err) { alert("Erreur lors du règlement"); }
    };

    const deleteDebt = async (id) => {
        if (!window.confirm("Supprimer définitivement cet engagement ?")) return;
        try {
            await api.delete(`/debts/${id}`);
            fetchDebts();
        } catch (err) { alert("Erreur lors de la suppression"); }
    };

    if (loading && debts.length === 0) return (
        <div className="flex flex-col items-center justify-center py-40">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Analyse des engagements...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8 animate-reveal pb-20">
            
            {/* RÉSUMÉ VISUEL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.2rem] border border-emerald-50 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-emerald-500">Total à percevoir (Créances)</p>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">{totalARecevoir.toLocaleString()} <span className="text-sm font-bold opacity-30">F</span></h2>
                </div>
                <div className="bg-white p-8 rounded-[2.2rem] border border-rose-50 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-rose-500">Total à rembourser (Dettes)</p>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">{totalAPayer.toLocaleString()} <span className="text-sm font-bold opacity-30">F</span></h2>
                </div>
            </div>

            {/* ACTION : PDF */}
            <button 
                onClick={generatePDF}
                className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
                📄 Exporter le bilan complet en PDF
            </button>

            {/* FORMULAIRE DE SAISIE */}
            <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${editingId ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-8">
                    <div className={`w-1.5 h-6 rounded-full ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`}></div>
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                        {editingId ? 'Modification de la fiche' : 'Nouvel engagement financier'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Nom du contact" value={formData.contact_name} onChange={(val) => setFormData({...formData, contact_name: val})} required placeholder="Ex: Jean Dupont" />
                    <InputField label="Email (Rappel auto)" type="email" value={formData.contact_email} onChange={(val) => setFormData({...formData, contact_email: val})} placeholder="contact@email.com" />
                    <InputField label="Montant FCFA" type="number" value={formData.amount} onChange={(val) => setFormData({...formData, amount: val})} required placeholder="0" />
                    
                    <div className="flex flex-col space-y-2">
                        <label className="text-[9px] font-black uppercase ml-2 text-slate-400 tracking-widest">Type d'engagement</label>
                        <select 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm appearance-none"
                            value={formData.type} 
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="a_recevoir">Argent qu'on me doit (Entrée future)</option>
                            <option value="a_payer">Argent que je dois (Sortie future)</option>
                        </select>
                    </div>

                    <InputField label="Date limite" type="date" value={formData.due_date} onChange={(val) => setFormData({...formData, due_date: val})} required />

                    <div className="md:col-span-2 flex flex-col space-y-2">
                        <label className="text-[9px] font-black uppercase ml-2 text-slate-400 tracking-widest">Note particulière</label>
                        <textarea 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none h-24 font-medium text-sm resize-none"
                            value={formData.notes} 
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Détails sur la raison du prêt ou de la dette..."
                        />
                    </div>
                    
                    <div className="md:col-span-2 flex gap-4">
                        <button type="submit" className={`flex-1 p-5 rounded-2xl font-black uppercase tracking-widest text-white shadow-xl transition-all ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-slate-900'}`}>
                            {editingId ? 'Mettre à jour' : 'Valider l\'enregistrement'}
                        </button>
                        {editingId && (
                            <button 
                                type="button" 
                                onClick={() => { setEditingId(null); setFormData({ contact_name: '', contact_email: '', amount: '', type: 'a_recevoir', due_date: '', notes: '' }); }}
                                className="px-10 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50"
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* LISTES DES ENGAGEMENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <ListSection title="💰 Créances à encaisser" color="emerald" data={debts.filter(d => d.type === 'a_recevoir')} actions={{markAsPaid, deleteDebt, handleEditClick}} />
                <ListSection title="💸 Dettes à payer" color="rose" data={debts.filter(d => d.type === 'a_payer')} actions={{markAsPaid, deleteDebt, handleEditClick}} />
            </div>
        </div>
    );
};

// --- SOUS-COMPOSANTS POUR LA CLARTÉ ---

const InputField = ({ label, type = "text", value, onChange, required = false, placeholder = "" }) => (
    <div className="flex flex-col space-y-2">
        <label className="text-[9px] font-black uppercase ml-2 text-slate-400 tracking-widest">{label}</label>
        <input 
            type={type} 
            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            required={required}
            placeholder={placeholder}
        />
    </div>
);

const ListSection = ({ title, color, data, actions }) => (
    <div className="space-y-6">
        <h4 className={`font-black text-${color}-500 text-[10px] uppercase tracking-[0.3em] px-2`}>{title}</h4>
        <div className="space-y-4">
            {data.length > 0 ? (
                data.map(debt => (
                    <DebtCard key={debt.id} debt={debt} onPay={actions.markAsPaid} onDelete={actions.deleteDebt} onEdit={actions.handleEditClick} />
                ))
            ) : (
                <div className="py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucun dossier trouvé</p>
                </div>
            )}
        </div>
    </div>
);

const DebtCard = ({ debt, onPay, onDelete, onEdit }) => {
    const isOverdue = new Date(debt.due_date) < new Date() && debt.status === 'en_attente';

    return (
        <div className={`p-6 rounded-[2.2rem] border transition-all duration-300 ${debt.status === 'paye' ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm hover:shadow-md group'}`}>
            <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${isOverdue ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {isOverdue ? 'Retard critique' : `Échéance : ${new Date(debt.due_date).toLocaleDateString('fr-FR')}`}
                        </span>
                        {debt.status === 'paye' && <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Réglé</span>}
                    </div>

                    <div>
                        <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{debt.contact_name}</p>
                        {debt.contact_email && <p className="text-[10px] text-blue-500 font-bold lowercase">{debt.contact_email}</p>}
                    </div>
                    
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">
                        {Number(debt.amount || 0).toLocaleString()} <span className="text-[10px] font-bold text-slate-300">FCFA</span>
                    </p>
                    
                    {debt.notes && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">"{debt.notes}"</p>
                    )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                    {debt.status === 'en_attente' && (
                        <>
                            <button onClick={() => onPay(debt.id)} className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100 hover:scale-110 transition-transform">✓</button>
                            <button onClick={() => onEdit(debt)} className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">✎</button>
                        </>
                    )}
                    <button onClick={() => onDelete(debt.id)} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-300 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">✕</button>
                </div>
            </div>
        </div>
    );
};

export default DebtManager;