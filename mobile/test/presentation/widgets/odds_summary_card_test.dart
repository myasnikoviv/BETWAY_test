import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/domain/models/bet_selection.dart';
import 'package:mobile/domain/models/bet_slip.dart';
import 'package:mobile/presentation/widgets/odds_summary_card.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final testSelection1 = const BetSelection(
    eventId: '101',
    eventName: 'Team A vs Team B',
    marketId: '201',
    marketName: '1X2',
    selectionId: '301',
    selectionName: 'Team A',
    odds: 1.50,
  );

  final testSelection2 = const BetSelection(
    eventId: '102',
    eventName: 'Team C vs Team D',
    marketId: '202',
    marketName: '1X2',
    selectionId: '302',
    selectionName: 'Team C',
    odds: 2.00,
  );

  Widget createSubject(BetSlip slip) {
    return MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(child: OddsSummaryCard(slip: slip)),
      ),
    );
  }

  group('OddsSummaryCard Widget Tests', () {
    testWidgets('renders multi bet summary with booking code and total odds', (
      tester,
    ) async {
      final multiSlip = BetSlip.create(
        bookingCode: 'BW987654',
        selections: [testSelection1, testSelection2],
        totalOdds: 3.00,
        isSingleBet: false,
      );

      await tester.pumpWidget(createSubject(multiSlip));

      expect(find.text('BW987654'), findsOneWidget);
      expect(find.text('Multi Bet (2 legs)'), findsOneWidget);
      expect(find.text('3.00'), findsOneWidget);
      expect(find.byKey(const Key('copy_booking_code_button')), findsOneWidget);
    });

    testWidgets('renders single bet summary without booking code gracefully', (
      tester,
    ) async {
      final singleSlip = BetSlip.create(
        bookingCode: null,
        selections: [testSelection1],
        totalOdds: 1.50,
        isSingleBet: true,
      );

      await tester.pumpWidget(createSubject(singleSlip));

      expect(find.text('UNSAVED'), findsOneWidget);
      expect(find.text('Single Bet'), findsOneWidget);
      expect(find.text('1.50'), findsOneWidget);
      expect(find.byKey(const Key('copy_booking_code_button')), findsNothing);
    });

    testWidgets('copy button triggers copy feedback and copies to clipboard', (
      tester,
    ) async {
      String? clipboardText;
      tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform,
        (MethodCall methodCall) async {
          if (methodCall.method == 'Clipboard.setData') {
            final Map<dynamic, dynamic>? args =
                methodCall.arguments as Map<dynamic, dynamic>?;
            clipboardText = args?['text'] as String?;
            return null;
          }
          return null;
        },
      );

      final slip = BetSlip.create(
        bookingCode: 'BW12345',
        selections: [testSelection1],
        totalOdds: 1.50,
        isSingleBet: true,
      );

      await tester.pumpWidget(createSubject(slip));

      final copyButton = find.byKey(const Key('copy_booking_code_button'));
      expect(copyButton, findsOneWidget);

      await tester.tap(copyButton);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(clipboardText, equals('BW12345'));
      expect(find.byIcon(Icons.check), findsOneWidget);

      // Advance clock past the reset timer
      await tester.pump(const Duration(seconds: 3));
    });
  });
}
