from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.holdings import HoldingService


class RiskService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.holding_service = HoldingService(db)

    async def analyze_portfolio_risk(self, user_id: int) -> Dict[str, Any]:
        """Analyze comprehensive portfolio risk."""
        portfolio_summary = await self.holding_service.get_portfolio_summary(user_id)
        allocation_data = await self.holding_service.get_allocation_data(user_id)

        if not portfolio_summary.holdings:
            return {"error": "No holdings found"}

        # Calculate various risk metrics
        concentration_risk = self._calculate_concentration_risk(allocation_data)
        sector_risk = self._calculate_sector_risk(allocation_data)
        country_risk = self._calculate_country_risk(allocation_data)
        volatility_risk = self._estimate_portfolio_volatility(
            portfolio_summary.holdings
        )

        overall_risk_score = self._calculate_overall_risk_score(
            concentration_risk, sector_risk, country_risk, volatility_risk
        )

        return {
            "overall_risk_score": overall_risk_score,
            "risk_level": self._get_risk_level(overall_risk_score),
            "concentration_risk": concentration_risk,
            "sector_risk": sector_risk,
            "country_risk": country_risk,
            "volatility_risk": volatility_risk,
            "recommendations": self._generate_risk_recommendations(
                concentration_risk, sector_risk, country_risk
            ),
        }

    async def generate_risk_heatmap(self, user_id: int) -> Dict[str, Any]:
        """Generate data for risk heatmap visualization."""
        allocation_data = await self.holding_service.get_allocation_data(user_id)

        # Create heatmap data structure
        heatmap_data = {"sectors": [], "countries": [], "asset_types": []}

        # Sector heatmap
        for sector, percentage in allocation_data.by_sector.items():
            risk_level = self._assess_sector_risk(sector, percentage)
            heatmap_data["sectors"].append(
                {
                    "name": sector,
                    "percentage": percentage,
                    "risk_level": risk_level,
                    "color_intensity": self._get_color_intensity(risk_level),
                }
            )

        # Country heatmap
        for country, percentage in allocation_data.by_country.items():
            risk_level = self._assess_country_risk(country, percentage)
            heatmap_data["countries"].append(
                {
                    "name": country,
                    "percentage": percentage,
                    "risk_level": risk_level,
                    "color_intensity": self._get_color_intensity(risk_level),
                }
            )

        return heatmap_data

    async def calculate_risk_metrics(self, user_id: int) -> Dict[str, Any]:
        """Calculate detailed risk metrics."""
        holdings = await self.holding_service.get_user_holdings(user_id)

        if not holdings:
            return {"error": "No holdings found"}

        # Portfolio-level metrics
        weights = [h.total_value for h in holdings]
        total_value = sum(weights)
        weights = [w / total_value for w in weights]

        # Concentration metrics
        hhi = sum(w**2 for w in weights)  # Herfindahl-Hirschman Index
        effective_holdings = 1 / hhi if hhi > 0 else 0

        # Diversification ratio
        max_weight = max(weights) if weights else 0

        return {
            "herfindahl_index": hhi,
            "effective_number_of_holdings": effective_holdings,
            "max_position_weight": max_weight,
            "concentration_score": self._calculate_concentration_score(weights),
            "diversification_score": 1 - max_weight,
            "risk_metrics": {
                "portfolio_volatility": self._estimate_portfolio_volatility(holdings),
                "value_at_risk_5pct": self._calculate_var(holdings, 0.05),
                "sharpe_estimation": self._estimate_sharpe_ratio(holdings),
            },
        }

    def _calculate_concentration_risk(self, allocation_data) -> float:
        """Calculate concentration risk based on allocation."""
        if not allocation_data.by_asset_type:
            return 100.0

        # Check for over-concentration in any asset type
        max_allocation = max(allocation_data.by_asset_type.values())
        if max_allocation > 80:
            return 90.0
        elif max_allocation > 60:
            return 70.0
        elif max_allocation > 40:
            return 50.0
        else:
            return 30.0

    def _calculate_sector_risk(self, allocation_data) -> float:
        """Calculate sector concentration risk."""
        if not allocation_data.by_sector:
            return 50.0  # Unknown sectors = medium risk

        max_sector = max(allocation_data.by_sector.values())
        if max_sector > 50:
            return 80.0
        elif max_sector > 30:
            return 60.0
        else:
            return 40.0

    def _calculate_country_risk(self, allocation_data) -> float:
        """Calculate country concentration risk."""
        if not allocation_data.by_country:
            return 50.0

        max_country = max(allocation_data.by_country.values())
        if max_country > 70:
            return 85.0
        elif max_country > 50:
            return 65.0
        else:
            return 45.0

    def _estimate_portfolio_volatility(self, holdings) -> float:
        """Estimate portfolio volatility."""
        # Simplified volatility estimation based on historical data
        # In production, use actual historical price data
        volatilities = []
        for holding in holdings:
            # Rough volatility estimates by asset type
            if holding.asset_type == "stock":
                vol = 0.20  # 20% annual volatility
            elif holding.asset_type == "crypto":
                vol = 0.80  # 80% annual volatility
            elif holding.asset_type == "bond":
                vol = 0.05  # 5% annual volatility
            else:
                vol = 0.15  # Default

            volatilities.append(vol)

        # Simple weighted average (ignores correlations)
        total_value = sum(h.total_value for h in holdings)
        weighted_vol = (
            sum(
                (h.total_value / total_value) * vol
                for h, vol in zip(holdings, volatilities)
            )
            if total_value > 0
            else 0
        )

        return weighted_vol

    def _calculate_overall_risk_score(
        self, concentration_risk, sector_risk, country_risk, volatility_risk
    ) -> float:
        """Calculate overall risk score."""
        # Weighted combination of risk factors
        return (
            concentration_risk * 0.3
            + sector_risk * 0.25
            + country_risk * 0.25
            + (volatility_risk * 100) * 0.20
        )

    def _get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to risk level."""
        if risk_score >= 70:
            return "high"
        elif risk_score >= 40:
            return "medium"
        else:
            return "low"

    def _assess_sector_risk(self, sector: str, percentage: float) -> str:
        """Assess risk level for a sector allocation."""
        high_risk_sectors = ["Technology", "Biotechnology", "Energy"]

        if sector in high_risk_sectors and percentage > 30:
            return "high"
        elif percentage > 50:
            return "high"
        elif percentage > 25:
            return "medium"
        else:
            return "low"

    def _assess_country_risk(self, country: str, percentage: float) -> str:
        """Assess risk level for a country allocation."""
        if percentage > 80:
            return "high"
        elif percentage > 60:
            return "medium"
        else:
            return "low"

    def _get_color_intensity(self, risk_level: str) -> float:
        """Get color intensity for heatmap visualization."""
        if risk_level == "high":
            return 1.0
        elif risk_level == "medium":
            return 0.6
        else:
            return 0.3

    def _calculate_concentration_score(self, weights) -> float:
        """Calculate concentration score using HHI."""
        hhi = sum(w**2 for w in weights)
        # Normalize to 0-100 scale
        return min(hhi * 100, 100)

    def _calculate_var(self, holdings, confidence_level: float) -> float:
        """Calculate Value at Risk."""
        # Simplified VaR calculation
        portfolio_value = sum(h.total_value for h in holdings)
        volatility = self._estimate_portfolio_volatility(holdings)

        # Assuming normal distribution
        z_score = 1.645 if confidence_level == 0.05 else 1.96  # 95% or 97.5%
        var = portfolio_value * volatility * z_score

        return var

    def _estimate_sharpe_ratio(self, holdings) -> float:
        """Estimate Sharpe ratio."""
        # Simplified estimation
        avg_return = (
            sum(h.profit_loss_percentage for h in holdings) / len(holdings)
            if holdings
            else 0
        )
        volatility = self._estimate_portfolio_volatility(holdings)

        # Assuming risk-free rate of 2%
        risk_free_rate = 2.0

        if volatility > 0:
            return (avg_return - risk_free_rate) / (volatility * 100)
        else:
            return 0.0

    def _generate_risk_recommendations(
        self, concentration_risk, sector_risk, country_risk
    ) -> list:
        """Generate risk-based recommendations."""
        recommendations = []

        if concentration_risk > 70:
            recommendations.append(
                "High concentration risk detected. Consider diversifying across asset types."
            )

        if sector_risk > 60:
            recommendations.append(
                "Sector concentration risk. Diversify across different sectors."
            )

        if country_risk > 70:
            recommendations.append(
                "Geographic concentration risk. Consider international diversification."
            )

        if not recommendations:
            recommendations.append(
                "Portfolio shows reasonable diversification. Monitor regularly."
            )

        return recommendations
