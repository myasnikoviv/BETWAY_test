import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/gateways/slip_gateway.dart';
import '../../domain/models/app_error.dart';
import 'slip_state.dart';

/// Presentation state manager (Cubit) for resolving and viewing Betway booking codes.
///
/// Strictly depends on the domain abstraction [SlipGateway] via constructor injection,
/// upholding the Dependency Inversion Principle (DIP).
class SlipCubit extends Cubit<SlipState> {
  final SlipGateway _gateway;

  SlipCubit(SlipGateway gateway)
    : _gateway = gateway,
      super(const SlipInitial());

  /// Resolves a Betway booking code and updates state accordingly.
  ///
  /// - Emits [SlipError] immediately if the input is empty or whitespace-only.
  /// - Emits [SlipLoading] while awaiting the gateway response.
  /// - Emits [SlipSuccess] with the canonical [BetSlip] domain model upon success.
  /// - Emits [SlipError] with error message and code upon failure.
  Future<void> resolve(String bookingCode) async {
    final trimmed = bookingCode.trim();
    if (trimmed.isEmpty) {
      emit(const SlipError('Please enter a valid booking code.'));
      return;
    }

    emit(const SlipLoading());
    try {
      final slip = await _gateway.resolve(trimmed);
      emit(SlipSuccess(slip));
    } on AppError catch (e) {
      emit(SlipError(e.message, code: e.code));
    } catch (e) {
      emit(const SlipError('An unexpected error occurred. Please retry.'));
    }
  }

  /// Alias for [resolve] matching the specification in the architectural skill document.
  Future<void> resolveBookingCode(String bookingCode) => resolve(bookingCode);

  /// Resets the state back to [SlipInitial].
  void reset() {
    emit(const SlipInitial());
  }
}
