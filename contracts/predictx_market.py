# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import typing

COINGECKO_IDS: dict[str, str] = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "BNB": "binancecoin",
    "XRP": "ripple",
    "ADA": "cardano",
    "DOGE": "dogecoin",
    "AVAX": "avalanche-2",
    "DOT": "polkadot",
    "MATIC": "matic-network",
}

class PredictXMarket(gl.Contract):
    prediction_count: u256
    all_data: str

    def __init__(self):
        self.prediction_count = u256(0)
        self.all_data = json.dumps({
            "predictions": {},
            "player_points": {}
        })

    def _load(self) -> dict:
        return json.loads(self.all_data)

    def _save(self, data: dict) -> None:
        self.all_data = json.dumps(data)

    def _calculate_multiplier(self, current_price: int, target_price: int, direction: str) -> int:
        if current_price <= 0:
            return 200

        distance_pct = abs(target_price - current_price) / current_price * 100

        if (direction == "ABOVE" and target_price < current_price) or \
           (direction == "BELOW" and target_price > current_price):
            distance_pct = distance_pct * 1.5

        if distance_pct < 2:
            return 120
        elif distance_pct < 5:
            return 150
        elif distance_pct < 10:
            return 200
        elif distance_pct < 20:
            return 300
        elif distance_pct < 35:
            return 500
        elif distance_pct < 50:
            return 800
        elif distance_pct < 75:
            return 1200
        else:
            return 2000

    def _get_current_price(self, asset: str) -> int:
        coin_id = COINGECKO_IDS.get(asset, asset.lower())
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd"
        web_data = gl.nondet.web.render(url, mode="text")

        task = f"""
Parse this CoinGecko API response and extract the USD price.

API Response:
{web_data}

Asset CoinGecko ID: "{coin_id}"

Respond ONLY with this JSON, no extra text, no markdown:
{{
    "price": int,
    "success": bool
}}
"""
        result = gl.nondet.exec_prompt(task).replace("```json", "").replace("```", "").strip()
        parsed = json.loads(result)
        return int(parsed.get("price", 0)) if parsed.get("success") else 0

    @gl.public.write
    def create_prediction(
        self,
        asset: str,
        direction: str,
        target_price: int,
        deadline: str,
        stake_amount: int,
        owner: str,
    ) -> typing.Any:
        asset = "".join(str(asset).split()).upper()
        direction = "".join(str(direction).split()).upper()

        if asset not in COINGECKO_IDS:
            raise gl.vm.UserError(f"Unsupported asset: {asset}")
        if direction not in ("ABOVE", "BELOW"):
            raise gl.vm.UserError("Direction must be ABOVE or BELOW")
        if int(target_price) <= 0:
            raise gl.vm.UserError("Target price must be positive")
        if int(stake_amount) < 10:
            raise gl.vm.UserError("Minimum stake is 10 GEN")

        def get_price_and_create() -> typing.Any:
            current_price = self._get_current_price(asset)

            if current_price <= 0:
                return {"success": False, "error": "Could not fetch current price"}

            multiplier = self._calculate_multiplier(
                current_price, int(target_price), direction
            )

            prediction_id = str(int(self.prediction_count) + 1)
            self.prediction_count = u256(int(self.prediction_count) + 1)

            prediction = {
                "id": prediction_id,
                "asset": asset,
                "direction": direction,
                "target_price": int(target_price),
                "current_price_at_creation": current_price,
                "deadline": str(deadline),
                "stake_amount": int(stake_amount),
                "multiplier": multiplier,
                "potential_return": int(stake_amount) * multiplier // 100,
                "owner": str(owner),
                "has_resolved": False,
                "is_cancelled": False,
                "outcome": "PENDING",
                "resolution_price": 0,
                "refund_amount": 0,
            }

            data = self._load()
            data["predictions"][prediction_id] = prediction
            self._save(data)

            return {
                "success": True,
                "prediction_id": prediction_id,
                "current_price": current_price,
                "multiplier": multiplier,
                "potential_return": int(stake_amount) * multiplier // 100,
            }

        return gl.eq_principle.strict_eq(get_price_and_create)

    @gl.public.write
    def cancel_prediction(self, prediction_id: str, owner: str) -> typing.Any:
        prediction_id = str(prediction_id)
        data = self._load()

        if prediction_id not in data["predictions"]:
            raise gl.vm.UserError("Prediction not found")

        prediction = data["predictions"][prediction_id]

        if str(prediction["owner"]) != str(owner):
            raise gl.vm.UserError("Only the owner can cancel")
        if prediction["has_resolved"]:
            raise gl.vm.UserError("Cannot cancel resolved prediction")
        if prediction["is_cancelled"]:
            raise gl.vm.UserError("Already cancelled")

        # 2 GEN cancellation fee
        cancellation_fee = 2
        stake = int(prediction["stake_amount"])
        refund = max(0, stake - cancellation_fee)

        data["predictions"][prediction_id]["is_cancelled"] = True
        data["predictions"][prediction_id]["outcome"] = "CANCELLED"
        data["predictions"][prediction_id]["refund_amount"] = refund
        self._save(data)

        return {
            "success": True,
            "refund_amount": refund,
            "cancellation_fee": cancellation_fee
        }

    @gl.public.write
    def resolve_prediction(self, prediction_id: str) -> typing.Any:
        prediction_id = str(prediction_id)
        data = self._load()

        if prediction_id not in data["predictions"]:
            raise gl.vm.UserError("Prediction not found")

        prediction = data["predictions"][prediction_id]

        if prediction["has_resolved"]:
            raise gl.vm.UserError("Already resolved")
        if prediction["is_cancelled"]:
            raise gl.vm.UserError("Cannot resolve cancelled prediction")

        asset = prediction["asset"]
        target_price = int(prediction["target_price"])
        direction = prediction["direction"]
        stake_amount = int(prediction["stake_amount"])
        multiplier = int(prediction["multiplier"])
        owner = str(prediction["owner"])

        def get_resolution() -> typing.Any:
            current_price = self._get_current_price(asset)

            if current_price <= 0:
                return {"success": False, "error": "Could not fetch price"}

            won = current_price > target_price if direction == "ABOVE" else current_price < target_price
            outcome = "WIN" if won else "LOSS"
            payout = stake_amount * multiplier // 100 if won else 0

            return {
                "success": True,
                "resolution_price": current_price,
                "outcome": outcome,
                "payout": payout,
            }

        result = gl.eq_principle.strict_eq(get_resolution)

        if result["success"]:
            data = self._load()
            data["predictions"][prediction_id]["has_resolved"] = True
            data["predictions"][prediction_id]["outcome"] = result["outcome"]
            data["predictions"][prediction_id]["resolution_price"] = result["resolution_price"]

            current_points = int(data["player_points"].get(owner, 0))
            if result["outcome"] == "WIN":
                data["player_points"][owner] = current_points + result["payout"]

            self._save(data)

        return result

    @gl.public.view
    def get_all_predictions(self) -> typing.Any:
        data = self._load()
        return list(data["predictions"].values())

    @gl.public.view
    def get_my_predictions(self, owner: str) -> typing.Any:
        data = self._load()
        return [
            p for p in data["predictions"].values()
            if str(p["owner"]) == str(owner)
        ]

    @gl.public.view
    def get_player_points(self, owner: str) -> int:
        data = self._load()
        return int(data["player_points"].get(str(owner), 0))

    @gl.public.view
    def get_leaderboard(self) -> typing.Any:
        data = self._load()
        entries = [
            {"address": addr, "points": int(pts)}
            for addr, pts in data["player_points"].items()
        ]
        return sorted(entries, key=lambda x: x["points"], reverse=True)

    @gl.public.view
    def get_stats(self) -> typing.Any:
        data = self._load()
        all_preds = list(data["predictions"].values())
        return {
            "total": len(all_preds),
            "resolved": sum(1 for p in all_preds if p["has_resolved"]),
            "pending": sum(1 for p in all_preds if not p["has_resolved"] and not p["is_cancelled"]),
            "cancelled": sum(1 for p in all_preds if p["is_cancelled"]),
            "wins": sum(1 for p in all_preds if p["outcome"] == "WIN"),
        }
