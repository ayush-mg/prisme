from packages.nlp.extractor import extractriskdata
def testextraction():
	newsarticle="Due to geopolitical tensions, the shipping lane capacity is reduced by 40 percent. Authorities expect this blockage to last for 14 days before standard routing resumes."
	extracteddata=extractriskdata(newsarticle)
	print("Extraction Proof:")
	print(f"Capacity Reduction: {extracteddata.capacityreduction}")
	print(f"Disruption Duration: {extracteddata.expecteddurationdays} days")
if __name__=="__main__":
	testextraction()