//
//  RulesScreen.swift
//  RiddleMania
//
//  Created by Wilson.Shakya on 07/07/24.
//

import Foundation
import SwiftUI

struct RulesScreen: View {
	@Environment(\.presentationMode) var presentationMode
	@EnvironmentObject var riddleData: RiddleData

	@State private var navigate: Bool = false

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
					Text("Rules")
				}.frame(maxWidth: .infinity)
			}.frame( minHeight: 25)
				.padding(.leading, 15)
				.padding(.trailing, 15)

			VStack(alignment: .center, spacing: 40) {
				VStack {
					Text(riddleData.riddleType.title)
					Text(riddleData.timerType.title)
				}

				Button(action: {
					navigate = true
				}) {
					Text("Continue")
						.frame(width: 100, height: 50)
				}.background(Color.clear)
					.overlay(
						RoundedRectangle(cornerRadius: 10)
							.stroke(Color.blue, lineWidth: 2)
					)
					.fullScreenCover(isPresented: $navigate) {
						RiddleScreen()
					}
			}.frame(maxHeight: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/)

		}.frame(maxWidth: .infinity, maxHeight: .infinity)
	}

}
