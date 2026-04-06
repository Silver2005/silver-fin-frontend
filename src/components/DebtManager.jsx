import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchDebts();
    }, []);

    const fetchDebts = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/debts', {
                headers: { Authorization: `Bearer ${token}` }
            });
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

            // Séparation des données
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
                didDrawPage: (data) => {
                    doc.setFontSize(10);
                    doc.setTextColor(16, 185, 129);
                    doc.text("LISTE DES CRÉANCES", 14, data.settings.startY - 3);
                }
            });

            // Calcul de la position pour le 2ème tableau
            const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60;

            // --- TABLEAU 2 : À PAYER ---
            autoTable(doc, {
                startY: finalY + 20,
                head: [['Dettes (À Payer)', 'Email', 'Échéance', 'Statut', 'Montant']],
                body: toPay.map(d => [
                    d.contact_name || 'Inconnu', 
                    d.contact_email || '-', 
                    d.due_date ? new Date(d.due_date).toLocaleDateString('fr-FR') : '-',
                    d.status === 'paye' ? 'RÉGLÉ' : 'EN ATTENTE',
                    `${Number(d.amount || 0).toLocaleString()} F`
                ]),
                headStyles: { fillColor: [244, 63, 94] },
                didDrawPage: (data) => {
                    doc.setFontSize(10);
                    doc.setTextColor(244, 63, 94);
                    doc.text("LISTE DES DETTES", 14, data.settings.startY - 3);
                }
            });

            doc.save(`SilverFin_Rapport_${dateStr.replace(/\//g, '-')}.pdf`);
        } catch (error) {
            console.error("Erreur PDF:", error);
            alert("Erreur lors de la génération. Détails dans la console.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://127.0.0.1:8000/api/debts/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEditingId(null);
            } else {
                await axios.post('http://127.0.0.1:8000/api/debts', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setFormData({ contact_name: '', contact_email: '', amount: '', type: 'a_recevoir', due_date: '', notes: '' });
            fetchDebts();
            alert("Opération réussie !");
        } catch (err) {
            alert("Erreur : " + (err.response?.data?.message || "Vérifiez vos champs"));
        }
    };

    const handleEditClick = (debt) => {
        setEditingId(debt.id);
        setFormData({
            contact_name: debt.contact_name,
            contact_email: debt.contact_email || '',
            amount: debt.amount,
            type: debt.type,
            due_date: debt.due_date,
            notes: debt.notes || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const markAsPaid = async (id) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/debts/${id}/pay`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDebts();
        } catch (err) { alert("Erreur lors du règlement"); }
    };

    const deleteDebt = async (id) => {
        if (!window.confirm("Supprimer définitivement ?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/debts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDebts();
        } catch (err) { alert("Erreur lors de la suppression"); }
    };

    if (loading) return <div className="p-20 text-center text-slate-300 font-black animate-pulse uppercase tracking-[0.3em]">Silver Fin...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8 animate-fadeIn pb-10">
            {/* COMPTEURS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm transition-transform hover:scale-[1.01]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-emerald-600">Total à encaisser</p>
                    <h2 className="text-4xl font-black text-slate-800">{totalARecevoir.toLocaleString()} <span className="text-sm font-medium opacity-50">FCFA</span></h2>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-rose-100 shadow-sm transition-transform hover:scale-[1.01]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-rose-500">Total à rembourser</p>
                    <h2 className="text-4xl font-black text-slate-800">{totalAPayer.toLocaleString()} <span className="text-sm font-medium opacity-50">FCFA</span></h2>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={generatePDF}
                    className="flex-1 bg-slate-900 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                    📄 Télécharger le rapport global (PDF)
                </button>
            </div>

            {/* FORMULAIRE */}
            <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${editingId ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-50 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-2 h-6 rounded-full ${editingId ? 'bg-orange-500' : 'bg-blue-600'}`}></div>
                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                        {editingId ? 'Modification de l\'engagement' : 'Enregistrement d\'un flux'}
                    </h3>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase ml-2 text-gray-400">Nom du contact</label>
                        <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                            value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} required />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase ml-2 text-gray-400">Email (Optionnel)</label>
                        <input type="email" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                            value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase ml-2 text-gray-400">Montant (FCFA)</label>
                        <input type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                            value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase ml-2 text-gray-400">Nature du flux</label>
                        <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                            value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                            <option value="a_recevoir">Argent qu'on me doit (Prêt)</option>
                            <option value="a_payer">Argent que je dois (Dette)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase ml-2 text-gray-400">Échéance</label>
                        <input type="date" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                            value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} required />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[9px] font-black uppercase ml-2 text-gray-400">Commentaire / Notes</label>
                        <textarea className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none h-20 font-medium text-sm"
                            value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                    </div>
                    
                    <div className="md:col-span-2 flex gap-3">
                        <button type="submit" className={`flex-1 p-4 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg transition-all ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-slate-900'}`}>
                            {editingId ? 'Confirmer les modifications' : 'Enregistrer l\'engagement'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setFormData({ contact_name: '', contact_email: '', amount: '', type: 'a_recevoir', due_date: '', notes: '' }); }}
                                className="px-8 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                                Annuler
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* LISTES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h4 className="font-black text-emerald-500 text-[10px] uppercase tracking-[0.3em] px-2">💰 À percevoir</h4>
                    <div className="space-y-4">
                        {debts.filter(d => d.type === 'a_recevoir').length > 0 ? (
                            debts.filter(d => d.type === 'a_recevoir').map(debt => (
                                <DebtCard key={debt.id} debt={debt} onPay={markAsPaid} onDelete={deleteDebt} onEdit={handleEditClick} />
                            ))
                        ) : <p className="text-xs text-gray-400 italic text-center py-10 bg-gray-50 rounded-3xl">Aucune créance enregistrée.</p>}
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="font-black text-rose-400 text-[10px] uppercase tracking-[0.3em] px-2">💸 À rembourser</h4>
                    <div className="space-y-4">
                        {debts.filter(d => d.type === 'a_payer').length > 0 ? (
                            debts.filter(d => d.type === 'a_payer').map(debt => (
                                <DebtCard key={debt.id} debt={debt} onPay={markAsPaid} onDelete={deleteDebt} onEdit={handleEditClick} />
                            ))
                        ) : <p className="text-xs text-gray-400 italic text-center py-10 bg-gray-50 rounded-3xl">Aucun engagement de paiement.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DebtCard = ({ debt, onPay, onDelete, onEdit }) => {
    const isOverdue = new Date(debt.due_date) < new Date() && debt.status === 'en_attente';

    return (
        <div className={`group p-6 rounded-[2rem] border transition-all duration-300 ${debt.status === 'paye' ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <p className={`text-[9px] font-black uppercase px-2 py-1 rounded ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                            {isOverdue ? '⚠️ Retard' : `Échéance : ${new Date(debt.due_date).toLocaleDateString('fr-FR')}`}
                        </p>
                        {debt.status === 'paye' && <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded">RÉGLÉ</span>}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-black text-slate-800 text-lg uppercase tracking-tighter leading-none">{debt.contact_name}</p>
                            {debt.contact_email && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>}
                        </div>
                        {debt.contact_email && <p className="text-[10px] text-blue-500 font-bold lowercase mt-0.5">{debt.contact_email}</p>}
                    </div>
                    
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">
                        {Number(debt.amount || 0).toLocaleString()} <span className="text-[10px] font-bold text-slate-400">FCFA</span>
                    </p>
                    
                    {debt.notes && (
                        <div className="bg-slate-50 p-3 rounded-xl">
                            <p className="text-[11px] text-slate-500 italic leading-snug">"{debt.notes}"</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col space-y-2">
                    {debt.status === 'en_attente' && (
                        <>
                            <button onClick={() => onPay(debt.id)} title="Régler" className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-90">✓</button>
                            <button onClick={() => onEdit(debt)} title="Modifier" className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">✎</button>
                        </>
                    )}
                    <button onClick={() => onDelete(debt.id)} title="Supprimer" className="p-4 bg-slate-50 text-slate-300 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">✕</button>
                </div>
            </div>
        </div>
    );
};

export default DebtManager;