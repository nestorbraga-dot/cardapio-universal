/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Review } from '../types';

interface AboutSectionProps {
  reviews: Review[];
}

export default function AboutSection({ reviews }: AboutSectionProps) {
  return (
    <section className="mt-20 border-t border-stone-200 pt-16" id="about-us-section">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-stone-900">
        
        {/* Info & Opening hours */}
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h2 className="font-serif text-lg font-bold uppercase tracking-wide mb-3">
              Nossa Casa
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed font-light">
              No Bistrô Sabor & Arte, cada detalhe é desenhado para alimentar a alma. Do pão rústico selado no calor do forno a lenha, até as reduções refinadas de vinho Cabernet Sauvignon que acompanham nossos cortes nobres.
            </p>
          </div>

          <div className="space-y-6 pt-4 border-t border-stone-100">
            <div>
              <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-stone-400 mb-1">Funcionamento</h4>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Terça a Quinta: 18h às 23h<br />
                Sexta e Sábado: 12h às 15h • 18h às 00h<br />
                Domingo: 12h às 17h
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-stone-400 mb-1">Localização</h4>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Alameda dos Sabores, 1024 - Jardins, São Paulo - SP
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-stone-400 mb-1">Reservas</h4>
              <p className="text-xs text-stone-600 font-mono">
                +55 (11) 98765-4321
              </p>
            </div>
          </div>
        </div>

        {/* Customer Reviews feedback */}
        <div className="lg:col-span-2 space-y-8" id="reviews-block">
          <div>
            <h2 className="font-serif text-lg font-bold uppercase tracking-wide mb-1">
              Avaliações
            </h2>
            <p className="text-xs text-stone-400 font-mono tracking-wider">MÉDIA GLOBAL — 4.9 / 5.0</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-transparent border border-stone-200 p-4 flex flex-col justify-between"
                id={`review-card-${rev.id}`}
              >
                <div>
                  <div className="flex text-stone-900 text-[10px] uppercase font-mono tracking-widest mb-3">
                    {Array.from({ length: rev.rating }).map((_, idx) => '★')}
                  </div>

                  <p className="text-stone-600 text-xs italic font-light leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-3 mt-4 text-[10px] font-mono tracking-wide text-stone-500">
                  <span className="font-semibold uppercase text-stone-800">
                    {rev.userName}
                  </span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
