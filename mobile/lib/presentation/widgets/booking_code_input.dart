import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/slip_cubit.dart';

/// Predefined quick sample booking codes for easy testing and demonstration.
const List<String> kSampleBookingCodes = ['BW6D7ABCFB', 'BW6D7AC4BA'];

/// Form widget for inputting, sanitizing, and submitting Betway Nigeria booking codes.
///
/// Dispatches resolution intents to [SlipCubit] or triggers an optional [onDecode] callback.
class BookingCodeInput extends StatefulWidget {
  /// Optional callback invoked when the user submits a booking code.
  /// If omitted, defaults to dispatching [SlipCubit.resolve].
  final void Function(String code)? onDecode;

  /// Optional text editing controller for external control/testing.
  final TextEditingController? controller;

  /// Whether a decode request is currently in flight (disables input and button).
  final bool isLoading;

  /// Optional external error message to display beneath the input field.
  final String? errorMessage;

  const BookingCodeInput({
    super.key,
    this.onDecode,
    this.controller,
    this.isLoading = false,
    this.errorMessage,
  });

  @override
  State<BookingCodeInput> createState() => _BookingCodeInputState();
}

class _BookingCodeInputState extends State<BookingCodeInput> {
  late final TextEditingController _controller;
  bool _isInternalController = false;
  String? _localError;

  @override
  void initState() {
    super.initState();
    if (widget.controller != null) {
      _controller = widget.controller!;
    } else {
      _controller = TextEditingController();
      _isInternalController = true;
    }
  }

  @override
  void dispose() {
    if (_isInternalController) {
      _controller.dispose();
    }
    super.dispose();
  }

  void _handleSubmit([String? explicitCode]) {
    final codeToSubmit = (explicitCode ?? _controller.text)
        .trim()
        .toUpperCase();

    if (codeToSubmit.isEmpty) {
      setState(() {
        _localError = 'Please enter a Betway booking code.';
      });
      return;
    }

    setState(() {
      _localError = null;
    });

    if (widget.onDecode != null) {
      widget.onDecode!(codeToSubmit);
    } else {
      context.read<SlipCubit>().resolve(codeToSubmit);
    }
  }

  Future<void> _handlePaste() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    final text = data?.text;
    if (text != null && text.trim().isNotEmpty) {
      final sanitized = text.trim().toUpperCase().replaceAll(
        RegExp(r'[^A-Z0-9]'),
        '',
      );
      _controller.text = sanitized;
      _controller.selection = TextSelection.fromPosition(
        TextPosition(offset: _controller.text.length),
      );
      setState(() {
        _localError = null;
      });
    }
  }

  void _handleSampleClick(String sampleCode) {
    _controller.text = sampleCode;
    _controller.selection = TextSelection.fromPosition(
      TextPosition(offset: _controller.text.length),
    );
    setState(() {
      _localError = null;
    });
    _handleSubmit(sampleCode);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveError = widget.errorMessage ?? _localError;
    final primaryColor = theme.colorScheme.primary;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: theme.colorScheme.outlineVariant.withAlpha(120),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Betway Booking Code',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Enter or paste any valid Betway Nigeria booking code (e.g. BW6D7ABCFB) to inspect its full bet slip.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              key: const Key('booking_code_text_field'),
              controller: _controller,
              enabled: !widget.isLoading,
              maxLength: 15,
              textCapitalization: TextCapitalization.characters,
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]')),
                UpperCaseTextFormatter(),
              ],
              onChanged: (_) {
                if (_localError != null) {
                  setState(() {
                    _localError = null;
                  });
                }
              },
              onSubmitted: (_) => _handleSubmit(),
              decoration: InputDecoration(
                hintText: 'e.g. BW6D7ABCFB',
                counterText: '',
                prefixIcon: const Icon(Icons.confirmation_number_outlined),
                suffixIcon: ValueListenableBuilder<TextEditingValue>(
                  valueListenable: _controller,
                  builder: (context, value, _) {
                    if (value.text.isNotEmpty && !widget.isLoading) {
                      return IconButton(
                        key: const Key('clear_code_button'),
                        icon: const Icon(Icons.clear, size: 20),
                        tooltip: 'Clear code',
                        onPressed: () {
                          _controller.clear();
                          setState(() {
                            _localError = null;
                          });
                        },
                      );
                    }
                    return IconButton(
                      key: const Key('paste_code_button'),
                      icon: const Icon(Icons.content_paste, size: 20),
                      tooltip: 'Paste from clipboard',
                      onPressed: widget.isLoading ? null : _handlePaste,
                    );
                  },
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 14,
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 48,
              child: FilledButton.icon(
                key: const Key('decode_slip_button'),
                onPressed: widget.isLoading ? null : () => _handleSubmit(),
                style: FilledButton.styleFrom(
                  backgroundColor: primaryColor,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                ),
                icon: widget.isLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.search, size: 20),
                label: Text(
                  widget.isLoading ? 'Decoding...' : 'Decode Slip',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
            if (effectiveError != null) ...[
              const SizedBox(height: 10),
              Container(
                key: const Key('booking_code_input_error'),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: theme.colorScheme.errorContainer.withAlpha(80),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: theme.colorScheme.error.withAlpha(120),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 18,
                      color: theme.colorScheme.error,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        effectiveError,
                        style: TextStyle(
                          color: theme.colorScheme.error,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 12),
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 8,
              runSpacing: 4,
              children: [
                Text(
                  'Quick Samples:',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                for (final sample in kSampleBookingCodes)
                  ActionChip(
                    key: Key('sample_chip_$sample'),
                    label: Text(
                      sample,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    onPressed: widget.isLoading
                        ? null
                        : () => _handleSampleClick(sample),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Formatter that transforms all entered characters to upper case.
class UpperCaseTextFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    return TextEditingValue(
      text: newValue.text.toUpperCase(),
      selection: newValue.selection,
    );
  }
}
