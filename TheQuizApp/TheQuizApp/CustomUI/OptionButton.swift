//
//  OptionButton.swift
//  RiddleMania
//
//  Created by Wilson.Shakya on 07/07/24.
//

import Foundation
import SwiftUI

struct OptionButton: View {
	let type: RiddleType
	let action: (() -> Void)

	var body: some View {
		Button(action: {
			fatalError("Crash was triggered")
			action()
		}) {
			Text(type.title)
				.frame(width: 100, height: 100)
		}.background(Color.clear)
			.overlay(
				RoundedRectangle(cornerRadius: 10)
					.stroke(Color.blue, lineWidth: 2)
			)
	}

}

