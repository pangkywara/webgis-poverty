import math

import numpy as np
import skfuzzy as fuzz
import skfuzzy.control as ctrl
import pandas as pd

PENGHASILAN_MAX = 5_000_000.0
SKALA_MAX = 10.0

# Human-readable labels for linguistic terms, used in the factor breakdown.
TERM_LABELS = {
    "sangat_rendah": "Sangat Rendah",
    "rendah":        "Rendah",
    "sedang":        "Sedang",
    "tinggi":        "Tinggi",
    "sedikit":       "Sedikit",
    "banyak":        "Banyak",
    "buruk":         "Buruk",
    "cukup":         "Cukup",
    "layak":         "Layak",
    "tidak_punya":   "Tidak Punya",
}


def build_fuzzy_system() -> ctrl.ControlSystem:
    """Build and return the Mamdani fuzzy control system (rule base only).

    Simulations are created per computation — ControlSystemSimulation holds
    mutable input/output state and must not be shared across threads.
    """
    penghasilan = ctrl.Antecedent(np.arange(0, PENGHASILAN_MAX + 1, 10_000), 'penghasilan')
    tanggungan  = ctrl.Antecedent(np.arange(0, SKALA_MAX + 0.1, 0.1),        'tanggungan')
    kondisi_rumah    = ctrl.Antecedent(np.arange(0, SKALA_MAX + 0.1, 0.1),   'kondisi_rumah')
    kepemilikan_aset = ctrl.Antecedent(np.arange(0, SKALA_MAX + 0.1, 0.1),   'kepemilikan_aset')

    prioritas = ctrl.Consequent(np.arange(0, 100.1, 0.1), 'prioritas')
    prioritas.defuzzify_method = 'centroid'

    # Edge sets use trapezoids saturating at the universe boundary, so clamped
    # extreme inputs (income 5M, tanggungan 10, aset 10) keep full membership
    # instead of dropping to 0 and silently deactivating every rule.
    penghasilan['sangat_rendah'] = fuzz.trimf(penghasilan.universe,  [0, 0, 1_500_000])
    penghasilan['rendah']        = fuzz.trimf(penghasilan.universe,  [500_000, 1_500_000, 2_500_000])
    penghasilan['sedang']        = fuzz.trimf(penghasilan.universe,  [1_500_000, 2_500_000, 3_500_000])
    penghasilan['tinggi']        = fuzz.trapmf(penghasilan.universe, [2_500_000, 4_000_000, 5_000_000, 5_000_000])

    tanggungan['sedikit'] = fuzz.trimf(tanggungan.universe,  [0, 0, 3])
    tanggungan['sedang']  = fuzz.trimf(tanggungan.universe,  [2, 4, 6])
    tanggungan['banyak']  = fuzz.trapmf(tanggungan.universe, [5, 7, 10, 10])

    kondisi_rumah['buruk'] = fuzz.trimf(kondisi_rumah.universe,  [0, 0, 4])
    kondisi_rumah['cukup'] = fuzz.trimf(kondisi_rumah.universe,  [3, 5, 7])
    kondisi_rumah['layak'] = fuzz.trapmf(kondisi_rumah.universe, [6, 8, 10, 10])

    kepemilikan_aset['tidak_punya'] = fuzz.trimf(kepemilikan_aset.universe,  [0, 0, 3])
    kepemilikan_aset['sedikit']     = fuzz.trimf(kepemilikan_aset.universe,  [2, 4, 6])
    kepemilikan_aset['cukup']       = fuzz.trapmf(kepemilikan_aset.universe, [5, 7, 10, 10])

    # Output sets are evenly spaced so each pure category defuzzifies to a
    # distinct centroid (~9, 30, 50, 70, ~91) that score_to_label can separate.
    prioritas['tidak_prioritas'] = fuzz.trapmf(prioritas.universe, [0, 0, 10, 25])
    prioritas['rendah']          = fuzz.trimf(prioritas.universe,  [15, 30, 45])
    prioritas['sedang']          = fuzz.trimf(prioritas.universe,  [35, 50, 65])
    prioritas['tinggi']          = fuzz.trimf(prioritas.universe,  [55, 70, 85])
    prioritas['sangat_tinggi']   = fuzz.trapmf(prioritas.universe, [75, 90, 100, 100])

    # Aggravating factors raise priority, mitigating factors lower it.
    memberatkan = (tanggungan['banyak']
                   | kondisi_rumah['buruk']
                   | kepemilikan_aset['tidak_punya'])
    # "Stable" baseline: explicitly no aggravating factor on any dimension.
    # Expressed with positive terms so the middle categories (tanggungan
    # sedang, rumah cukup, aset sedikit) actually participate in the decision.
    stabil = ((tanggungan['sedikit'] | tanggungan['sedang'])
              & (kondisi_rumah['cukup'] | kondisi_rumah['layak'])
              & (kepemilikan_aset['sedikit'] | kepemilikan_aset['cukup']))
    meringankan = kondisi_rumah['layak'] & kepemilikan_aset['cukup']

    rules = [
        # ── Penghasilan sangat rendah: baseline TINGGI ──
        ctrl.Rule(penghasilan['sangat_rendah'] & memberatkan,
                  prioritas['sangat_tinggi']),
        ctrl.Rule(penghasilan['sangat_rendah'] & stabil,
                  prioritas['tinggi']),
        ctrl.Rule(penghasilan['sangat_rendah'] & meringankan,
                  prioritas['sedang']),

        # ── Penghasilan rendah: baseline SEDANG ──
        ctrl.Rule(penghasilan['rendah'] & tanggungan['banyak']
                  & (kondisi_rumah['buruk'] | kepemilikan_aset['tidak_punya']),
                  prioritas['sangat_tinggi']),
        ctrl.Rule(penghasilan['rendah'] & memberatkan,
                  prioritas['tinggi']),
        ctrl.Rule(penghasilan['rendah'] & stabil,
                  prioritas['sedang']),
        ctrl.Rule(penghasilan['rendah'] & tanggungan['sedikit'] & meringankan,
                  prioritas['rendah']),

        # ── Penghasilan sedang: baseline RENDAH ──
        ctrl.Rule(penghasilan['sedang'] & tanggungan['banyak'] & kondisi_rumah['buruk'],
                  prioritas['tinggi']),
        ctrl.Rule(penghasilan['sedang'] & memberatkan,
                  prioritas['sedang']),
        ctrl.Rule(penghasilan['sedang'] & stabil,
                  prioritas['rendah']),
        ctrl.Rule(penghasilan['sedang'] & meringankan,
                  prioritas['tidak_prioritas']),

        # ── Penghasilan tinggi: baseline TIDAK PRIORITAS ──
        ctrl.Rule(penghasilan['tinggi'] & tanggungan['banyak']
                  & kondisi_rumah['buruk'] & kepemilikan_aset['tidak_punya'],
                  prioritas['sedang']),
        ctrl.Rule(penghasilan['tinggi'] & memberatkan,
                  prioritas['rendah']),
        ctrl.Rule(penghasilan['tinggi'] & stabil,
                  prioritas['tidak_prioritas']),
    ]

    return ctrl.ControlSystem(rules)


def _clamp_inputs(penghasilan: float,
                  tanggungan: float,
                  kondisi_rumah: float,
                  kepemilikan_aset: float) -> dict:
    """Clamp inputs to universe boundaries — values outside the range
    would zero all membership activations and kill every rule."""
    values = {
        'penghasilan':      max(0.0, min(PENGHASILAN_MAX, float(penghasilan))),
        'tanggungan':       max(0.0, min(SKALA_MAX,       float(tanggungan))),
        'kondisi_rumah':    max(0.0, min(SKALA_MAX,       float(kondisi_rumah))),
        'kepemilikan_aset': max(0.0, min(SKALA_MAX,       float(kepemilikan_aset))),
    }
    for name, v in values.items():
        if not math.isfinite(v):
            raise ValueError(f"Input '{name}' is not a finite number")
    return values


def compute_priority(system: ctrl.ControlSystem,
                     penghasilan: float,
                     tanggungan: float,
                     kondisi_rumah: float,
                     kepemilikan_aset: float) -> float:
    """Run simulation for one warga, return priority score 0-100."""
    values = _clamp_inputs(penghasilan, tanggungan, kondisi_rumah, kepemilikan_aset)
    sim = ctrl.ControlSystemSimulation(system)
    for name, v in values.items():
        sim.input[name] = v
    sim.compute()
    return float(np.clip(sim.output['prioritas'], 0.0, 100.0))


def describe_inputs(system: ctrl.ControlSystem,
                    penghasilan: float,
                    tanggungan: float,
                    kondisi_rumah: float,
                    kepemilikan_aset: float) -> dict:
    """Return the dominant linguistic category and membership degree per input,
    so the decision can be explained to the user."""
    values = _clamp_inputs(penghasilan, tanggungan, kondisi_rumah, kepemilikan_aset)
    detail = {}
    for var in system.antecedents:
        x = values[var.label]
        memberships = {
            name: float(fuzz.interp_membership(var.universe, term.mf, x))
            for name, term in var.terms.items()
        }
        dominant = max(memberships, key=memberships.get)
        detail[var.label] = {
            'kategori': TERM_LABELS.get(dominant, dominant),
            'derajat': round(memberships[dominant], 2),
        }
    return detail


def score_to_label(score: float) -> str:
    """Convert numeric score to Indonesian priority category label.

    Thresholds sit at the midpoints between the centroids of the output sets
    (~9, 30, 50, 70, ~91), so a pure category result maps back to its own label.
    """
    if score >= 80:
        return "SANGAT TINGGI"
    elif score >= 60:
        return "TINGGI"
    elif score >= 40:
        return "SEDANG"
    elif score >= 20:
        return "RENDAH"
    else:
        return "TIDAK PRIORITAS"


def run_batch(system: ctrl.ControlSystem,
              df: pd.DataFrame) -> pd.DataFrame:
    """Run all rows in dataframe, return df with skor and prioritas columns added."""
    result = df.copy()
    scores = [
        compute_priority(system, row['penghasilan'], row['tanggungan'],
                         row['kondisi_rumah'], row['kepemilikan_aset'])
        for _, row in result.iterrows()
    ]
    result['skor'] = scores
    result['prioritas'] = [score_to_label(s) for s in scores]
    return result
