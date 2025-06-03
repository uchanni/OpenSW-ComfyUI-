from nodes import CLIPTextEncode

class DummyCLIP:
    def tokenize(self, text):
        return text.split()

    def encode_from_tokens_scheduled(self, tokens):
        return f"Encoded({tokens})"

def test_extract_and_rank():
    text = "A man with a gun is speeding down the road on a motorcycle."
    encoder = CLIPTextEncode()
    dummy_clip = DummyCLIP()
    encoded = encoder.encode(dummy_clip, text)
   # print("Encoded output:", encoded)

test_extract_and_rank()
