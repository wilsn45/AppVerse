//
//  TimerSelectionView.swift
//  RiddleMania
//
//  Created by Wilson.Shakya on 07/07/24.
//

import Foundation
import SwiftUI

struct TimerSelectionView: View {
	@Environment(\.presentationMode) var presentationMode
	@EnvironmentObject var riddleData: RiddleData
	@State private var showRulesScreen = false

	var body: some View {
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
					Text("Select Time")
				}.frame(maxWidth: .infinity)
			}.frame( minHeight: 25)
				.padding(.leading, 15)
				.padding(.trailing, 15)

			VStack(alignment: .center) {
				VStack {
					TimerOptionButton(type: .oneMin) {
						riddleData.timerType = .oneMin
						showRulesScreen = true
					}
					TimerOptionButton(type: .threeMin) {
						riddleData.timerType = .threeMin
						showRulesScreen = true
					}
					TimerOptionButton(type: .fiveMin) {
						riddleData.timerType = .fiveMin
						showRulesScreen = true
					}
				}
			}.frame(maxHeight: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/)
				.fullScreenCover(isPresented: $showRulesScreen) {
					RulesScreen()
				}

		}.frame(maxWidth: .infinity, maxHeight: .infinity)
	}



}
