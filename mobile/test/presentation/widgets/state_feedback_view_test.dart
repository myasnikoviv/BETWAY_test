import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/domain/models/app_error.dart';
import 'package:mobile/presentation/widgets/state_feedback_view.dart';

void main() {
  group('State Feedback Views', () {
    testWidgets('SlipLoadingView renders spinner, title, and custom message', (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SlipLoadingView(message: 'Custom loading message'),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('BW'), findsOneWidget);
      expect(find.text('Fetching Bet Slip'), findsOneWidget);
      expect(find.text('Custom loading message'), findsOneWidget);
    });

    testWidgets('SlipInitialView renders empty placeholder with instructions', (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: SlipInitialView())),
      );

      expect(find.byIcon(Icons.receipt_long_outlined), findsOneWidget);
      expect(find.text('No Bet Slip Loaded'), findsOneWidget);
      expect(
        find.text(
          'Enter a Betway Nigeria booking code above or tap one of the quick samples to decode match events, markets, selections, and total odds.',
        ),
        findsOneWidget,
      );
    });

    testWidgets(
      'SlipErrorView renders error message, code badge, and calls onRetry',
      (tester) async {
        bool retryClicked = false;

        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: SlipErrorView(
                message: 'Custom error occurred',
                code: AppErrorCodes.bookingCodeNotFound,
                onRetry: () {
                  retryClicked = true;
                },
              ),
            ),
          ),
        );

        expect(find.text('Failed to Decode Booking Code'), findsOneWidget);
        expect(find.text('Custom error occurred'), findsOneWidget);
        expect(find.text(AppErrorCodes.bookingCodeNotFound), findsOneWidget);

        final retryButton = find.byKey(const Key('error_retry_button'));
        expect(retryButton, findsOneWidget);

        await tester.tap(retryButton);
        await tester.pump();

        expect(retryClicked, isTrue);
      },
    );
  });
}
