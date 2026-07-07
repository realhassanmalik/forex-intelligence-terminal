from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EconomicEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    currency: str
    impact: str
    event_time: datetime
    forecast: str | None = None
    previous: str | None = None
    actual: str | None = None
    affected_pairs: list[str] = []

    @classmethod
    def from_orm_split(cls, obj) -> "EconomicEventOut":
        return cls(
            id=obj.id,
            title=obj.title,
            currency=obj.currency,
            impact=obj.impact,
            event_time=obj.event_time,
            forecast=obj.forecast,
            previous=obj.previous,
            actual=obj.actual,
            affected_pairs=[p for p in obj.affected_pairs.split(",") if p],
        )
