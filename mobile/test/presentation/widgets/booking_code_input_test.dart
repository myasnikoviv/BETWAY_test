import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/presentation/widgets/booking_code_input.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  Widget createSubject({
    void Function(String)? onDecode,
    TextEditingController? controller,
    bool isLoading = false,
    String? errorMessage,
  }) {
    return MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: BookingCodeInput(
            onDecode: onDecode,
            controller: controller,
            isLoading: isLoading,
            errorMessage: errorMessage,
          ),
        ),
      ),
    );
  }

  group('BookingCodeInput Widget Tests', () {
    testWidgets('renders input elements, hint, and quick samples', (
      tester,
    ) async {
      await tester.pumpWidget(createSubject());

      expect(find.text('Betway Booking Code'), findsOneWidget);
      expect(find.byKey(const Key('booking_code_text_field')), findsOneWidget);
      expect(find.byKey(const Key('decode_slip_button')), findsOneWidget);
      expect(find.text('Quick Samples:'), findsOneWidget);
      expect(find.byKey(const Key('sample_chip_BW6D7ABCFB')), findsOneWidget);
      expect(find.byKey(const Key('sample_chip_BW6D7AC4BA')), findsOneWidget);
    });

    testWidgets('formats lowercase letters to uppercase automatically', (
      tester,
    ) async {
      final controller = TextEditingController();
      await tester.pumpWidget(createSubject(controller: controller));

      await tester.enterText(
        find.byKey(const Key('booking_code_text_field')),
        'bw6d7abcfb',
      );
      await tester.pump();

      expect(controller.text, equals('BW6D7ABCFB'));
    });

    testWidgets('filters out non-alphanumeric characters', (tester) async {
      final controller = TextEditingController();
      await tester.pumpWidget(createSubject(controller: controller));

      await tester.enterText(
        find.byKey(const Key('booking_code_text_field')),
        'BW-6D@7#AB!',
      );
      await tester.pump();

      expect(controller.text, equals('BW6D7AB'));
    });

    testWidgets('tapping sample chip populates text and calls onDecode', (
      tester,
    ) async {
      String? submittedCode;
      await tester.pumpWidget(
        createSubject(
          onDecode: (code) {
            submittedCode = code;
          },
        ),
      );

      await tester.tap(find.byKey(const Key('sample_chip_BW6D7ABCFB')));
      await tester.pump();

      expect(submittedCode, equals('BW6D7ABCFB'));
    });

    testWidgets('shows local validation error when submitted empty', (
      tester,
    ) async {
      String? submittedCode;
      await tester.pumpWidget(
        createSubject(
          onDecode: (code) {
            submittedCode = code;
          },
        ),
      );

      await tester.tap(find.byKey(const Key('decode_slip_button')));
      await tester.pump();

      expect(find.text('Please enter a Betway booking code.'), findsOneWidget);
      expect(submittedCode, isNull);
    });

    testWidgets('displays external error message when provided', (
      tester,
    ) async {
      await tester.pumpWidget(
        createSubject(errorMessage: 'Invalid booking code format.'),
      );

      expect(find.text('Invalid booking code format.'), findsOneWidget);
      expect(find.byKey(const Key('booking_code_input_error')), findsOneWidget);
    });

    testWidgets('clear button clears input text', (tester) async {
      final controller = TextEditingController(text: 'BW123');
      await tester.pumpWidget(createSubject(controller: controller));

      final clearButton = find.byKey(const Key('clear_code_button'));
      expect(clearButton, findsOneWidget);

      await tester.tap(clearButton);
      await tester.pump();

      expect(controller.text, isEmpty);
    });

    testWidgets('paste button populates sanitized text from clipboard', (
      tester,
    ) async {
      tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform,
        (MethodCall methodCall) async {
          if (methodCall.method == 'Clipboard.getData') {
            return {'text': '  bw-6d7abc  \n'};
          }
          return null;
        },
      );

      final controller = TextEditingController();
      await tester.pumpWidget(createSubject(controller: controller));

      final pasteButton = find.byKey(const Key('paste_code_button'));
      expect(pasteButton, findsOneWidget);

      await tester.tap(pasteButton);
      await tester.pump();

      expect(controller.text, equals('BW6D7ABC'));
    });

    testWidgets('disables input and decode button when isLoading is true', (
      tester,
    ) async {
      await tester.pumpWidget(createSubject(isLoading: true));

      final textField = tester.widget<TextField>(
        find.byKey(const Key('booking_code_text_field')),
      );
      expect(textField.enabled, isFalse);

      final decodeButton = tester.widget<FilledButton>(
        find.byKey(const Key('decode_slip_button')),
      );
      expect(decodeButton.onPressed, isNull);
      expect(find.text('Decoding...'), findsOneWidget);
    });
  });
}
