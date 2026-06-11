from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import logging

from fuzzy.engine import (
    build_fuzzy_system,
    compute_priority,
    describe_inputs,
    score_to_label,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_system = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _system
    logger.info("Building fuzzy control system...")
    _system = build_fuzzy_system()
    logger.info("Fuzzy system ready.")
    yield


app = FastAPI(title="Fuzzy Bansos API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HouseholdInput(BaseModel):
    id: int = 0
    penghasilan: float = Field(default=1_500_000, ge=0)
    tanggungan: float = Field(default=3, ge=0)
    kondisi_rumah: float = Field(default=5, ge=0)
    kepemilikan_aset: float = Field(default=5, ge=0)


class BatchInput(BaseModel):
    households: List[HouseholdInput]


class FactorDetail(BaseModel):
    kategori: str
    derajat: float


class ScoreResult(BaseModel):
    id: int
    score: float
    label: str
    faktor: Optional[Dict[str, FactorDetail]] = None


def _score_household(hh: HouseholdInput, with_detail: bool = False) -> ScoreResult:
    try:
        score = compute_priority(
            _system, hh.penghasilan, hh.tanggungan, hh.kondisi_rumah, hh.kepemilikan_aset
        )
        faktor = (
            describe_inputs(
                _system, hh.penghasilan, hh.tanggungan, hh.kondisi_rumah, hh.kepemilikan_aset
            )
            if with_detail else None
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception:
        logger.exception("Fuzzy computation failed for household id=%s", hh.id)
        raise HTTPException(status_code=500, detail="Fuzzy computation failed")
    return ScoreResult(id=hh.id, score=round(score, 2), label=score_to_label(score), faktor=faktor)


@app.get("/health")
def health():
    return {"status": "ok", "system_ready": _system is not None}


@app.post("/compute", response_model=ScoreResult)
def compute_single(data: HouseholdInput):
    if _system is None:
        raise HTTPException(status_code=503, detail="Fuzzy system not ready")
    return _score_household(data, with_detail=True)


@app.post("/batch")
def compute_batch(data: BatchInput):
    if _system is None:
        raise HTTPException(status_code=503, detail="Fuzzy system not ready")
    results = [_score_household(hh) for hh in data.households]
    return {"results": [r.model_dump(exclude_none=True) for r in results]}
