import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile/domain/gateways/slip_gateway.dart';
import 'package:mobile/domain/models/app_error.dart';
import 'package:mobile/domain/models/bet_selection.dart';
import 'package:mobile/domain/models/bet_slip.dart';
import 'package:mobile/presentation/cubit/slip_cubit.dart';
import 'package:mobile/presentation/cubit/slip_state.dart';

class MockSlipGateway extends Mock implements SlipGateway {}

void main() {
  late MockSlipGateway mockGateway;
  late SlipCubit slipCubit;

  final testSelection = const BetSelection(
    eventId: '1001',
    eventName: 'Arsenal vs Chelsea',
    marketId: '2001',
    marketName: '1X2',
    selectionId: '3001',
    selectionName: 'Home',
    odds: 1.85,
    league: 'Premier League',
    sportId: 'soccer',
  );

  final testSlip = BetSlip.create(
    bookingCode: 'BW12345',
    selections: [testSelection],
    totalOdds: 1.85,
    isSingleBet: true,
    createdAt: '2026-09-01T12:00:00.000Z',
  );

  setUp(() {
    mockGateway = MockSlipGateway();
    slipCubit = SlipCubit(mockGateway);
  });

  tearDown(() {
    slipCubit.close();
  });

  group('SlipCubit', () {
    test('initial state is SlipInitial', () {
      expect(slipCubit.state, equals(const SlipInitial()));
    });

    group('resolve', () {
      blocTest<SlipCubit, SlipState>(
        'emits [SlipLoading, SlipSuccess] when resolve succeeds',
        build: () {
          when(
            () => mockGateway.resolve('BW12345'),
          ).thenAnswer((_) async => testSlip);
          return slipCubit;
        },
        act: (cubit) => cubit.resolve('BW12345'),
        expect: () => [const SlipLoading(), SlipSuccess(testSlip)],
        verify: (_) {
          verify(() => mockGateway.resolve('BW12345')).called(1);
        },
      );

      blocTest<SlipCubit, SlipState>(
        'emits [SlipLoading, SlipSuccess] when resolveBookingCode alias is used',
        build: () {
          when(
            () => mockGateway.resolve('BW12345'),
          ).thenAnswer((_) async => testSlip);
          return slipCubit;
        },
        act: (cubit) => cubit.resolveBookingCode('BW12345'),
        expect: () => [const SlipLoading(), SlipSuccess(testSlip)],
        verify: (_) {
          verify(() => mockGateway.resolve('BW12345')).called(1);
        },
      );

      blocTest<SlipCubit, SlipState>(
        'trims leading and trailing whitespace from booking code before calling gateway',
        build: () {
          when(
            () => mockGateway.resolve('BW12345'),
          ).thenAnswer((_) async => testSlip);
          return slipCubit;
        },
        act: (cubit) => cubit.resolve('   BW12345 \t\n '),
        expect: () => [const SlipLoading(), SlipSuccess(testSlip)],
        verify: (_) {
          verify(() => mockGateway.resolve('BW12345')).called(1);
        },
      );

      blocTest<SlipCubit, SlipState>(
        'emits [SlipError] for empty input without invoking gateway',
        build: () => slipCubit,
        act: (cubit) => cubit.resolve(''),
        expect: () => [const SlipError('Please enter a valid booking code.')],
        verify: (_) {
          verifyZeroInteractions(mockGateway);
        },
      );

      blocTest<SlipCubit, SlipState>(
        'emits [SlipError] for whitespace-only input without invoking gateway',
        build: () => slipCubit,
        act: (cubit) => cubit.resolve('    \t   \n  '),
        expect: () => [const SlipError('Please enter a valid booking code.')],
        verify: (_) {
          verifyZeroInteractions(mockGateway);
        },
      );

      blocTest<SlipCubit, SlipState>(
        'emits [SlipLoading, SlipError] when gateway throws AppError.notFound',
        build: () {
          when(() => mockGateway.resolve('BW99999')).thenThrow(
            AppError.notFound(
              message:
                  'The provided Betway booking code could not be found or has expired.',
            ),
          );
          return slipCubit;
        },
        act: (cubit) => cubit.resolve('BW99999'),
        expect: () => [
          const SlipLoading(),
          const SlipError(
            'The provided Betway booking code could not be found or has expired.',
            code: AppErrorCodes.bookingCodeNotFound,
          ),
        ],
      );

      blocTest<SlipCubit, SlipState>(
        'emits [SlipLoading, SlipError] when gateway throws AppError.staleSelections',
        build: () {
          when(() => mockGateway.resolve('BWSTALE')).thenThrow(
            AppError.staleSelections(
              message:
                  'One or more selections are no longer active or available.',
            ),
          );
          return slipCubit;
        },
        act: (cubit) => cubit.resolve('BWSTALE'),
        expect: () => [
          const SlipLoading(),
          const SlipError(
            'One or more selections are no longer active or available.',
            code: AppErrorCodes.staleSelections,
          ),
        ],
      );

      blocTest<SlipCubit, SlipState>(
        'emits [SlipLoading, SlipError] when gateway throws AppError.upstreamError',
        build: () {
          when(() => mockGateway.resolve('BWFAIL')).thenThrow(
            AppError.upstreamError(
              message: 'Failed to communicate with Betway upstream service.',
            ),
          );
          return slipCubit;
        },
        act: (cubit) => cubit.resolve('BWFAIL'),
        expect: () => [
          const SlipLoading(),
          const SlipError(
            'Failed to communicate with Betway upstream service.',
            code: AppErrorCodes.upstreamBetwayError,
          ),
        ],
      );

      blocTest<SlipCubit, SlipState>(
        'emits [SlipLoading, SlipError] when gateway throws AppError.networkError',
        build: () {
          when(() => mockGateway.resolve('BWNET')).thenThrow(
            AppError.networkError(
              message:
                  'Network connection failed. Please check your internet connection.',
            ),
          );
          return slipCubit;
        },
        act: (cubit) => cubit.resolve('BWNET'),
        expect: () => [
          const SlipLoading(),
          const SlipError(
            'Network connection failed. Please check your internet connection.',
            code: AppErrorCodes.networkError,
          ),
        ],
      );

      blocTest<SlipCubit, SlipState>(
        'emits [SlipLoading, SlipError] when gateway throws AppError.invalidInput',
        build: () {
          when(() => mockGateway.resolve('BAD')).thenThrow(
            AppError.invalidInput(
              message:
                  'Booking code must be alphanumeric and 4 to 15 characters long.',
            ),
          );
          return slipCubit;
        },
        act: (cubit) => cubit.resolve('BAD'),
        expect: () => [
          const SlipLoading(),
          const SlipError(
            'Booking code must be alphanumeric and 4 to 15 characters long.',
            code: AppErrorCodes.invalidInput,
          ),
        ],
      );

      blocTest<SlipCubit, SlipState>(
        'emits [SlipLoading, SlipError] when gateway throws AppError.internal',
        build: () {
          when(() => mockGateway.resolve('BWERR')).thenThrow(
            AppError.internal(
              message: 'An unexpected internal error occurred.',
            ),
          );
          return slipCubit;
        },
        act: (cubit) => cubit.resolve('BWERR'),
        expect: () => [
          const SlipLoading(),
          const SlipError(
            'An unexpected internal error occurred.',
            code: AppErrorCodes.internalServerError,
          ),
        ],
      );

      blocTest<SlipCubit, SlipState>(
        'emits [SlipLoading, SlipError] when gateway throws a generic unhandled Exception',
        build: () {
          when(
            () => mockGateway.resolve('BWUNKNOWN'),
          ).thenThrow(Exception('Unknown fatal crash'));
          return slipCubit;
        },
        act: (cubit) => cubit.resolve('BWUNKNOWN'),
        expect: () => [
          const SlipLoading(),
          const SlipError('An unexpected error occurred. Please retry.'),
        ],
      );
    });

    group('reset', () {
      blocTest<SlipCubit, SlipState>(
        'resets state to SlipInitial after a successful resolution',
        build: () {
          when(
            () => mockGateway.resolve('BW12345'),
          ).thenAnswer((_) async => testSlip);
          return slipCubit;
        },
        act: (cubit) async {
          await cubit.resolve('BW12345');
          cubit.reset();
        },
        expect: () => [
          const SlipLoading(),
          SlipSuccess(testSlip),
          const SlipInitial(),
        ],
      );

      blocTest<SlipCubit, SlipState>(
        'resets state to SlipInitial after an error state',
        build: () => slipCubit,
        act: (cubit) {
          cubit.resolve('');
          cubit.reset();
        },
        expect: () => [
          const SlipError('Please enter a valid booking code.'),
          const SlipInitial(),
        ],
      );
    });
  });
}
