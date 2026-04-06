import React from 'react';

const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-100">
            
            {/* BARRE DE HAUT */}
            <nav className="flex justify-between items-center px-6 py-6 max-w-6xl mx-auto">
                <div className="flex items-center gap-2 group cursor-default">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold italic group-hover:rotate-6 transition-transform">S</div>
                    <span className="font-bold text-lg tracking-tight uppercase">Silver Fin</span>
                </div>
                <button 
                    onClick={onGetStarted}
                    className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                >
                    Connexion
                </button>
            </nav>

            {/* MESSAGE PRINCIPAL */}
            <section className="px-6 pt-20 pb-24 max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-8 tracking-tighter">
                    Gérez votre argent <br />
                    <span className="text-blue-600 underline decoration-blue-100 decoration-8 underline-offset-4">sans prise de tête.</span>
                </h1>
                
                <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto mb-12 leading-relaxed">
                    Une application simple pour noter vos dépenses, suivre vos revenus et savoir exactement où vous en êtes à la fin du mois.
                </p>

                <div className="flex justify-center">
                    <button 
                        onClick={onGetStarted}
                        className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                    >
                        Commencer maintenant
                    </button>
                </div>
            </section>

            {/* LES OUTILS - VERSION ÉPURÉE SANS EMOJIS */}
            <section className="px-6 py-24 bg-slate-50 border-y border-slate-100">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                    
                    {/* BLOC 1 */}
                    <div className="group">
                        <div className="h-1.5 w-12 bg-blue-600 mb-8 group-hover:w-24 transition-all duration-500"></div>
                        <h3 className="text-lg font-black uppercase tracking-tight mb-4 text-slate-900">
                            Suivi de budget
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            Notez chaque achat en quelques secondes et voyez votre solde s'actualiser en temps réel. Simple et sans détour.
                        </p>
                    </div>

                    {/* BLOC 2 */}
                    <div className="group">
                        <div className="h-1.5 w-12 bg-slate-300 mb-8 group-hover:bg-blue-600 group-hover:w-24 transition-all duration-500"></div>
                        <h3 className="text-lg font-black uppercase tracking-tight mb-4 text-slate-900">
                            Gestion des dettes
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            N'oubliez plus jamais qui vous doit de l'argent ou ce que vous devez rembourser. Suivez vos créances avec précision.
                        </p>
                    </div>

                    {/* BLOC 3 */}
                    <div className="group">
                        <div className="h-1.5 w-12 bg-slate-300 mb-8 group-hover:bg-blue-600 group-hover:w-24 transition-all duration-500"></div>
                        <h3 className="text-lg font-black uppercase tracking-tight mb-4 text-slate-900">
                            Rapports clairs
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            Des graphiques simples pour identifier vos plus grosses dépenses et optimiser votre épargne chaque mois.
                        </p>
                    </div>

                </div>
            </section>

            {/* PIED DE PAGE */}
            <footer className="py-16 text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">
                    Silver Fin &copy; 2026 — develloppé par silver's design
                </p>
            </footer>

        </div>
    );
};

export default LandingPage;