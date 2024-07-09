//
//  RiddleOptionButton.swift
//  RiddleMania
//
//  Created by Wilson.Shakya on 08/07/24.
//

import Foundation

import Foundation
import SwiftUI

struct RiddleOptionButton: View {
	let data: RiddleOption?
	let action: ((String) -> Void)

	var body: some View {
		Button(action: {
			action(data?.id ?? "")
		}) {
			Text(data?.option ?? "___")
				.frame(width: 100, height: 100)
		}.background(Color.clear)
			.overlay(
				RoundedRectangle(cornerRadius: 10)
					.stroke(Color.blue, lineWidth: 2)
			)
	}

}
