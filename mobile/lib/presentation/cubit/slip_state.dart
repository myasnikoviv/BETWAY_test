import 'package:equatable/equatable.dart';
import '../../domain/models/bet_slip.dart';

/// Sealed base class representing all possible UI states of the Bet Slip viewer.
sealed class SlipState extends Equatable {
  const SlipState();

  @override
  List<Object?> get props => [];
}

/// Initial resting state before the user enters a booking code.
final class SlipInitial extends SlipState {
  const SlipInitial();
}

/// Loading state emitted while resolving or validating a booking code.
final class SlipLoading extends SlipState {
  const SlipLoading();
}

/// Success state containing the canonical [BetSlip] domain model.
final class SlipSuccess extends SlipState {
  final BetSlip slip;

  const SlipSuccess(this.slip);

  @override
  List<Object?> get props => [slip];
}

/// Error state containing a user-facing error [message] and optional error [code].
final class SlipError extends SlipState {
  final String message;
  final String? code;

  const SlipError(this.message, {this.code});

  @override
  List<Object?> get props => [message, code];
}
