import '../models/bet_slip.dart';

/// Domain Gateway abstraction for Bet Slip operations.
///
/// Consumers (such as SlipCubit) MUST depend strictly on this abstraction,
/// adhering to the Dependency Inversion Principle (DIP).
abstract interface class SlipGateway {
  /// Resolves an existing Betway booking code into a canonical [BetSlip].
  ///
  /// Throws [AppError] on validation, not found, stale selections, or upstream errors.
  Future<BetSlip> resolve(String bookingCode);
}
