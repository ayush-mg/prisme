from packages.nlp.extractor import extractriskdata

def runaccuracytests():
	print("Starting NLP accuracy tests... Please wait.")
	testcases = [
		("Capacity reduced by 40 percent for 14 days.", 0.4, 14),
		("The port capacity dropped 50% for 30 days.", 0.5, 30),
		("No disruption expected.", 0.0, 0)
	]
	
	passedtests = 0
	totaltests = len(testcases)
	
	for text, expectedcap, expecteddur in testcases:
		print(f"\nProcessing: '{text}'")
		result = extractriskdata(text)
		
		if result.capacityreduction == expectedcap and result.expecteddurationdays == expecteddur:
			passedtests += 1
			print("Result: PASSED")
		else:
			print("Result: FAILED")
			print(f"Expected: {expectedcap} cap, {expecteddur} days")
			print(f"Extracted: {result.capacityreduction} cap, {result.expecteddurationdays} days")
			
	accuracy = (passedtests / totaltests) * 100
	print(f"\n====================================")
	print(f"Total Pipeline Accuracy: {accuracy}%")
	print(f"====================================")

if __name__ == "__main__":
	runaccuracytests()