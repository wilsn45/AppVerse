//
//  RiddleScreen.swift
//  RiddleMania
//
//  Created by Wilson.Shakya on 07/07/24.
//

import Foundation
import SwiftUI


struct RiddleScreen: View {

	@Environment(\.presentationMode) var presentationMode
	@EnvironmentObject var riddleData: RiddleData

	@State private var navigate: Bool = false

	@State private var question: String = "Some Question that user will answer"
	@State private var questionImage: String = "Some Image"

	var optionData: RiddleOptionData {
		var options = [RiddleOption]()
		options.append(RiddleOption(id: "one", option: "Option One"))
		options.append(RiddleOption(id: "two", option: "Option Two"))
		options.append(RiddleOption(id: "three", option: "Option Three"))
		options.append(RiddleOption(id: "four", option: "Option Four"))

		return RiddleOptionData(options: options, correctOption: "four")
	}


	var body: some View {
		VStack {
			VStack {
				HStack() {
					Button(action: {
						presentationMode.wrappedValue.dismiss()
					}) {
						Image(systemName: "chevron.left")
							.foregroundColor(.black)
					}
					.frame(width: 25)

					HStack(alignment: /*@START_MENU_TOKEN@*/.center/*@END_MENU_TOKEN@*/) {
						Text("Riddle")
					}.frame(maxWidth: .infinity)

				}.frame(maxHeight: 25)
					.padding(.leading, 15)
					.padding(.trailing, 15)

				TimeTracker(totalTime: riddleData.timerType.value) {
					navigateToResult()
				}
			}
			

			VStack(alignment: .center) {
				VStack(spacing: 20) {
					VStack {
						Text(question)
						Image("")
					}
					VStack {
						RiddleOptionsView(data: optionData) { result in
							updateNextQuestion(previousAnswere: result)
						}
					}

				}

			}.frame(maxHeight: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/)

		}.frame(maxWidth: .infinity, maxHeight: .infinity)
	}

	private func updateNextQuestion(previousAnswere: Bool) {
		
	}


	private func navigateToResult() {

	}

}
