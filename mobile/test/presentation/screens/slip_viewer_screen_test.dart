import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile/domain/models/app_error.dart';
import 'package:mobile/domain/models/bet_selection.dart';
import 'package:mobile/domain/models/bet_slip.dart';
import 'package:mobile/presentation/cubit/slip_cubit.dart';
import 'package:mobile/presentation/cubit/slip_state.dart';
import 'package:mobile/presentation/screens/slip_viewer_screen.dart';
import 'package:mobile/presentation/widgets/booking_code_input.dart';
import 'package:mobile/presentation/widgets/odds_summary_card.dart';
import 'package:mobile/presentation/widgets/selection_card.dart';
import 'package:mobile/presentation/widgets/state_feedback_view.dart';

class MockSlipCubit extends MockCubit<SlipState> implements SlipCubit {}

void main() {
  late MockSlipCubit mockCubit;

  final sampleSelection1 = const BetSelection(
    eventId: '101',
    eventName: 'Arsenal FC vs Chelsea FC',
    marketId: '201',
    marketName: '1X2 (Full Time)',
    selectionId: '301',
    selectionName: 'Arsenal FC',
    odds: 2.10,
    league: 'Premier League',
    region: 'England',
    sportId: 'soccer',
  );

  final sampleSelection2 = const BetSelection(
    eventId: '102',
    eventName: 'Real Madrid vs Barcelona',
    marketId: '202',
    marketName: 'Over / Under 2.5 Goals',
    selectionId: '302',
    selectionName: 'Over 2.5',
    odds: 1.75,
    league: 'La Liga',
    region: 'Spain',
    sportId: 'soccer',
  );

  final sampleSlip = BetSlip.create(
    bookingCode: 'BW6D7ABCFB',
    selections: [sampleSelection1, sampleSelection2],
    totalOdds: 3.68,
    isSingleBet: false,
    createdAt: '2026-09-01T12:00:00.000Z',
  );

  Widget createSubject({MockSlipCubit? cubit}) {
    return MaterialApp(
      home: BlocProvider<SlipCubit>.value(
        value: cubit ?? mockCubit,
        child: const SlipViewerScreen(),
      ),
    );
  }

  setUp(() {
    mockCubit = MockSlipCubit();
  });

  group('SlipViewerScreen', () {
    testWidgets('renders AppBar with title and BookingCodeInput', (
      tester,
    ) async {
      when(() => mockCubit.state).thenReturn(const SlipInitial());

      await tester.pumpWidget(createSubject());

      expect(find.text('Betway Nigeria Slip Viewer'), findsOneWidget);
      expect(find.byType(BookingCodeInput), findsOneWidget);
      expect(find.byKey(const Key('booking_code_text_field')), findsOneWidget);
      expect(find.byKey(const Key('decode_slip_button')), findsOneWidget);
    });

    testWidgets('renders SlipInitialView when state is SlipInitial', (
      tester,
    ) async {
      when(() => mockCubit.state).thenReturn(const SlipInitial());

      await tester.pumpWidget(createSubject());

      expect(find.byType(SlipInitialView), findsOneWidget);
      expect(find.text('No Bet Slip Loaded'), findsOneWidget);
      expect(find.byType(SlipLoadingView), findsNothing);
      expect(find.byType(SlipErrorView), findsNothing);
      expect(find.byType(OddsSummaryCard), findsNothing);
    });

    testWidgets('renders SlipLoadingView when state is SlipLoading', (
      tester,
    ) async {
      when(() => mockCubit.state).thenReturn(const SlipLoading());

      await tester.pumpWidget(createSubject());

      expect(find.byType(SlipLoadingView), findsOneWidget);
      expect(find.text('Fetching Bet Slip'), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsWidgets);
      expect(find.byType(SlipInitialView), findsNothing);
      expect(find.byType(SlipErrorView), findsNothing);
    });

    testWidgets(
      'renders SlipErrorView with error message and code when state is SlipError',
      (tester) async {
        when(() => mockCubit.state).thenReturn(
          const SlipError(
            'The provided Betway booking code could not be found or has expired.',
            code: AppErrorCodes.bookingCodeNotFound,
          ),
        );

        await tester.pumpWidget(createSubject());

        expect(find.byType(SlipErrorView), findsOneWidget);
        expect(find.text('Failed to Decode Booking Code'), findsOneWidget);
        expect(
          find.text(
            'The provided Betway booking code could not be found or has expired.',
          ),
          findsOneWidget,
        );
        expect(find.text(AppErrorCodes.bookingCodeNotFound), findsOneWidget);
        expect(find.byKey(const Key('error_retry_button')), findsOneWidget);
        expect(find.byKey(const Key('reset_app_bar_button')), findsOneWidget);
      },
    );

    testWidgets(
      'renders OddsSummaryCard and SelectionCards when state is SlipSuccess',
      (tester) async {
        when(() => mockCubit.state).thenReturn(SlipSuccess(sampleSlip));

        await tester.pumpWidget(createSubject());

        expect(find.byType(OddsSummaryCard), findsOneWidget);
        expect(find.text('BW6D7ABCFB'), findsWidgets);
        expect(find.text('Multi Bet (2 legs)'), findsOneWidget);
        expect(find.text('3.68'), findsOneWidget);
        expect(find.text('Selections (2)'), findsOneWidget);

        expect(find.byType(SelectionCard), findsNWidgets(2));
        expect(find.text('Arsenal FC vs Chelsea FC'), findsOneWidget);
        expect(find.text('Real Madrid vs Barcelona'), findsOneWidget);
        expect(find.text('1X2 (Full Time)'), findsOneWidget);
        expect(find.text('Over / Under 2.5 Goals'), findsOneWidget);
        expect(find.text('2.10'), findsOneWidget);
        expect(find.text('1.75'), findsOneWidget);
        expect(find.byKey(const Key('reset_app_bar_button')), findsOneWidget);
      },
    );

    testWidgets(
      'entering code and tapping Decode dispatches resolve to cubit',
      (tester) async {
        when(() => mockCubit.state).thenReturn(const SlipInitial());
        when(() => mockCubit.resolve(any())).thenAnswer((_) async {});

        await tester.pumpWidget(createSubject());

        final textField = find.byKey(const Key('booking_code_text_field'));
        final decodeButton = find.byKey(const Key('decode_slip_button'));

        await tester.enterText(textField, 'BW6D7ABCFB');
        await tester.pump();
        await tester.tap(decodeButton);
        await tester.pump();

        verify(() => mockCubit.resolve('BW6D7ABCFB')).called(1);
      },
    );

    testWidgets(
      'tapping quick sample chip populates text and dispatches resolve to cubit',
      (tester) async {
        when(() => mockCubit.state).thenReturn(const SlipInitial());
        when(() => mockCubit.resolve(any())).thenAnswer((_) async {});

        await tester.pumpWidget(createSubject());

        final sampleChip = find.byKey(const Key('sample_chip_BW6D7ABCFB'));
        expect(sampleChip, findsOneWidget);

        await tester.tap(sampleChip);
        await tester.pump();

        verify(() => mockCubit.resolve('BW6D7ABCFB')).called(1);
      },
    );

    testWidgets('tapping retry button on error dispatches resolve to cubit', (
      tester,
    ) async {
      when(() => mockCubit.state).thenReturn(
        const SlipError(
          'Network connection failed.',
          code: AppErrorCodes.networkError,
        ),
      );
      when(() => mockCubit.resolve(any())).thenAnswer((_) async {});

      await tester.pumpWidget(createSubject());

      // Enter code in text field first
      final textField = find.byKey(const Key('booking_code_text_field'));
      await tester.enterText(textField, 'BW6D7ABCFB');
      await tester.pump();

      final retryButton = find.byKey(const Key('error_retry_button'));
      expect(retryButton, findsOneWidget);

      await tester.tap(retryButton);
      await tester.pump();

      verify(() => mockCubit.resolve('BW6D7ABCFB')).called(1);
    });

    testWidgets('tapping reset button in AppBar dispatches reset to cubit', (
      tester,
    ) async {
      when(() => mockCubit.state).thenReturn(SlipSuccess(sampleSlip));
      when(() => mockCubit.reset()).thenReturn(null);

      await tester.pumpWidget(createSubject());

      final resetButton = find.byKey(const Key('reset_app_bar_button'));
      expect(resetButton, findsOneWidget);

      await tester.tap(resetButton);
      await tester.pump();

      verify(() => mockCubit.reset()).called(1);
    });

    testWidgets(
      'responsive layout renders multi-leg bet slip without any overflow',
      (tester) async {
        final longSlip = BetSlip.create(
          bookingCode: 'BWLONGSLIP123',
          selections: List.generate(
            10,
            (i) => BetSelection(
              eventId: '${100 + i}',
              eventName:
                  'Super Long Team Name Football Club $i vs Another Very Long Opponent Team Name $i',
              marketId: '${200 + i}',
              marketName:
                  'Extremely Detailed Market Description - Over/Under Total Team Goals And Both Teams Score ($i)',
              selectionId: '${300 + i}',
              selectionName: 'Selection Outcome Long Name $i',
              odds: 1.50 + (i * 0.1),
              league: 'Premier Long League Name Division One',
              region: 'United Kingdom of Great Britain and Northern Ireland',
              sportId: 'soccer',
            ),
          ),
          totalOdds: 125.45,
          isSingleBet: false,
          createdAt: '2026-09-01T12:00:00.000Z',
        );

        when(() => mockCubit.state).thenReturn(SlipSuccess(longSlip));

        // Test in small screen dimension
        tester.view.physicalSize = const Size(360, 640);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);

        await tester.pumpWidget(createSubject());
        await tester.pumpAndSettle();

        expect(find.byType(OddsSummaryCard), findsOneWidget);
        expect(find.text('Selections (10)'), findsOneWidget);
        expect(find.byType(SelectionCard), findsWidgets);
        expect(tester.takeException(), isNull);
      },
    );
  });
}
